import os
from openai import OpenAI
import os
import tempfile
import base64
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response

from .whisper_utils import transcribe_file
from .coqui_tts import synthesize_speech_b64
from .models import VoiceConversation, VoiceMessage

# Допустим, у вас где-то есть план подписки
from subscriptions.models import UserSubscription
from subscriptions.utils import check_and_increment_requests

api_key = os.environ.get('OPENAI_API_KEY', None)
client = OpenAI(api_key=api_key)


def get_model_for_user(user):
    """
    Возвращает название GPT-модели в зависимости от подписки пользователя.
    """
    if not user.is_authenticated:
        return "gpt-3.5-turbo"

    try:
        sub = user.usersubscription
    except UserSubscription.DoesNotExist:
        return "gpt-3.5-turbo"

    plan = sub.plan
    if plan.allow_gpt4:
        return "gpt-4"
    return "gpt-3.5-turbo"
    

class TopicListView(APIView):
    def get(self, request):
        topics = ["business", "travel", "doctor", "interview"]
        return Response(topics)



from django.db import transaction
from .models import VoiceConversation, VoiceMessage

class StartConversationView(APIView):
    """
    POST /api/conversation/start/
    body: {"topic":"business"}
    Возвращаем { conversation_id, created:bool, ... }
    """
    def post(self, request):
        topic = request.data.get('topic',"").strip()
        if not topic:
            return Response({"error":"No topic provided"}, status=400)

        # проверим, что topic в ["business","travel","doctor","interview"]?
        # иначе 400, если хотите
        if topic not in ["business","travel","doctor","interview"]:
            return Response({"error":"Invalid topic"}, status=400)

        user = request.user
        if not user.is_authenticated:
            return Response({"error":"Not authenticated"}, status=401)

        with transaction.atomic():
            conv, created = VoiceConversation.objects.get_or_create(
                user=user,
                topic=topic,
                defaults={"total_messages":0}
            )
            if created:
                # 1) system
                VoiceMessage.objects.create(
                    conversation=conv,
                    role="system",
                    text=self.build_system_for_topic(topic)
                )
                # 2) assistant приветствие
                greet_text = self.build_greeting_for_topic(topic)
                VoiceMessage.objects.create(
                    conversation=conv,
                    role="assistant",
                    text=greet_text
                )
                conv.total_messages += 2
                conv.save()

        return Response({
            "conversation_id": conv.id,
            "created": created,
            "message": ("New conversation" if created else "Already existed")
        })

    def build_system_for_topic(self, topic:str) -> str:
        # Это "system"-назначение (инструкции GPT)
        if topic=="business":
            return "You are an AI specialized in Business English..."
        elif topic=="travel":
            return "You are an AI specialized in Travel English..."
        elif topic=="doctor":
            return "You are an AI specialized in medical English..."
        elif topic=="interview":
            return "You are an AI specialized in job interview English..."
        return "You are an AI English tutor."

    def build_greeting_for_topic(self, topic:str) -> str:
        # Это "assistant" приветствие — оно сразу попадёт в историю
        if topic=="business":
            return "Hello! I'm your Business English AI. Let's discuss formal/business topics."
        elif topic=="travel":
            return "Hi there! I'm your Travel English assistant..."
        elif topic=="doctor":
            return "Hello, I'm Dr. AI. How can I help you today?"
        elif topic=="interview":
            return "Greetings! I'm your interview simulator..."
        return "Hello! I'm your English tutor."




from rest_framework.views import APIView
from rest_framework.response import Response
import tempfile, os

from django.db import transaction

from .models import VoiceConversation, VoiceMessage
from .whisper_utils import transcribe_file
from .coqui_tts import synthesize_speech_b64
from .gpt_utils import call_gpt_chat
from subscriptions.utils import check_and_increment_requests
from stats.models import EventLog
class ConversationView(APIView):
    """
    POST /api/conversation/<conv_id>/
      form-data: audio=@file
    Возвращает { transcript, assistant_text, assistant_audio_b64, ... }
    """
    def post(self, request, conv_id):
        EventLog.objects.create(
            user=request.user,
            event_type="enter_conversation"
        )
        if not check_and_increment_requests(request.user):
            return Response({"error":"Limit reached"}, status=403)

        user = request.user
        if not user.is_authenticated:
            return Response({"error":"Not authenticated"}, status=401)

        # ищем беседу
        try:
            conv = VoiceConversation.objects.get(pk=conv_id, user=user)
        except VoiceConversation.DoesNotExist:
            return Response({"error":"Conversation not found"}, status=404)

        # извлекаем файл
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({"error":"No audio file"}, status=400)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            transcript = transcribe_file(tmp_path)  # Whisper
        except Exception as e:
            os.remove(tmp_path)
            return Response({"error":f"Whisper error: {str(e)}"}, status=500)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        # сохраняем user-message
        with transaction.atomic():
            VoiceMessage.objects.create(
                conversation=conv,
                role="user",
                text=transcript
            )
            conv.total_messages += 1
            conv.save()

        # собираем все сообщения => GPT
        msgs = self.build_gpt_messages(conv)
        try:
            assistant_text = call_gpt_chat(user, msgs)
        except Exception as e:
            return Response({"error":f"GPT error: {str(e)}","transcript":transcript}, status=500)

        # сохраняем assistant
        with transaction.atomic():
            VoiceMessage.objects.create(
                conversation=conv,
                role="assistant",
                text=assistant_text
            )
            conv.total_messages += 1
            conv.save()

        # TTS
        try:
            audio_b64 = synthesize_speech_b64(assistant_text)
        except Exception as e:
            return Response({
                "transcript": transcript,
                "assistant_text": assistant_text,
                "error": f"TTS error: {str(e)}"
            }, status=500)

        # возвращаем JSON
        return Response({
            "transcript": transcript,  # что сказал пользователь
            "assistant_text": assistant_text,
            "assistant_audio_b64": audio_b64
        })

    def build_gpt_messages(self, conv: VoiceConversation):
        # query all VoiceMessage
        qs = conv.messages.order_by('created_at')
        arr = []
        for m in qs:
            if m.role in ("assistant","user","system"):
                role = m.role
            else:
                role = "user"  # fallback
            arr.append({"role":role, "content":m.text})
        return arr




class GetConversationHistoryView(APIView):
    """
    GET /api/conversation/<conv_id>/history/
    Возвращает массив сообщений [{role, content, created_at}, ...]
    """
    def get(self, request, conv_id):
        user = request.user
        if not user.is_authenticated:
            return Response({"error":"Not auth"}, status=401)
        try:
            conv = VoiceConversation.objects.get(pk=conv_id, user=user)
        except VoiceConversation.DoesNotExist:
            return Response({"error":"Not found"}, status=404)

        msgs = conv.messages.order_by('created_at')
        data = []
        for m in msgs:
            data.append({
                "role": m.role,
                "content": m.text,
                "created_at": m.created_at.isoformat()
            })
        return Response(data)
