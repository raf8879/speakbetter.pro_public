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
#
#
# class ConversationView(APIView):
#     """
#     POST /api/conversation/
#     form-data:
#       audio=@file.wav
#       feedback=true/false (опционально, по умолчанию true)
#
#     Логика:
#     1) Принимаем аудио, сохраняем во временный файл
#     2) Whisper -> text
#     3) Если user авторизован, храним в БД (VoiceConversation/VoiceMessage),
#        иначе (гость) храним в Redis
#     4) Отправляем контекст + user_message в GPT -> assistant_message (+ FEEDBACK:...)
#     5) Генерируем TTS (Coqui) для assistant_message, возвращаем в base64
#     6) При желании добавляем feedback, если feedback=true и GPT выдало "FEEDBACK:..."
#     """
#
#     def post(self, request):
#         if not check_and_increment_requests(request.user):
#             return Response({"error": "Request limit reached. Please upgrade or wait."},
#                             status=403)
#         # 1) Проверяем, есть ли аудио
#         audio_file = request.FILES.get('audio')
#         if not audio_file:
#             return Response({"error": "No audio file provided"}, status=400)
#
#         # Валидация размера (например, до 10 МБ)
#         if audio_file.size > 10 * 1024 * 1024:
#             return Response({"error": "Audio file too large (>10MB)"}, status=400)
#
#         feedback_mode = (request.data.get('feedback', 'true').lower() == 'true')
#
#         # 2) Сохраняем аудио во временный файл и отправляем в Whisper
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             for chunk in audio_file.chunks():
#                 tmp.write(chunk)
#             tmp_path = tmp.name
#
#         try:
#             transcript = transcribe_file(tmp_path)
#         except Exception as e:
#             os.remove(tmp_path)
#             return Response({"error": f"Whisper error: {str(e)}"}, status=500)
#         finally:
#             # Сразу удаляем, чтобы не хранить запись
#             if os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#
#         # 3) Авторизованный пользователь или гость?
#         if request.user.is_authenticated:
#             conv, _ = VoiceConversation.objects.get_or_create(
#                 user=request.user,
#                 defaults={"created_at": timezone.now()}
#             )
#             # Запишем user-сообщение
#             with transaction.atomic():
#                 conv.total_messages += 1
#                 conv.save()
#                 VoiceMessage.objects.create(
#                     conversation=conv,
#                     role="user",
#                     text=transcript
#                 )
#             # Сформируем контекст GPT (из БД)
#             messages = self.build_gpt_messages(conv)
#         else:
#             # Гость => Redis
#             guest_id = request.COOKIES.get('guest_id', 'anon')
#             redis_key = f"conv_chat:{guest_id}"
#             messages = cache.get(redis_key, [])
#
#             # Если нет system — добавим
#             has_system = any(m["role"] == "system" for m in messages)
#             if not has_system:
#                 messages.insert(0, {
#                     "role": "system",
#                     "content": (
#                         "You are an AI English tutor. "
#                         "If user has mistakes, append 'FEEDBACK: ...' at the end."
#                     )
#                 })
#
#             messages.append({"role": "user", "content": transcript})
#
#             # Сохраняем обратно в кеш (позже, после GPT-ответа)
#             # (Но можно и сразу, если хотите)
#             # cache.set(redis_key, messages, timeout=24*3600)
#
#         # Ограничиваем 20 сообщений
#         if len(messages) > 20:
#             messages.pop(1)  # не трогаем system
#
#         # 4) GPT
#         # openai.api_key = os.environ.get("OPENAI_API_KEY", "")
#         model_name = get_model_for_user(request.user)
#
#         try:
#             gpt_response = client.chat.completions.create(
#                 model=model_name,
#                 messages=messages
#             )
#             assistant_text = gpt_response.choices[0].message.content
#         except OpenAIError as e:
#             return Response({"transcript": transcript, "error": f"GPT error: {str(e)}"})
#         except Exception as e:
#             return Response({"transcript": transcript, "error": f"GPT error: {str(e)}"})
#
#         # Разделяем FEEDBACK, если есть
#         feedback_text = None
#         if "FEEDBACK:" in assistant_text:
#             parts = assistant_text.split("FEEDBACK:")
#             main_reply = parts[0].strip()
#             feedback_text = parts[1].strip() if len(parts) > 1 else None
#         else:
#             main_reply = assistant_text
#
#         # Сохраняем assistant_message
#         if request.user.is_authenticated:
#             with transaction.atomic():
#                 conv.total_messages += 1
#                 conv.save()
#                 VoiceMessage.objects.create(
#                     conversation=conv,
#                     role="assistant",
#                     text=main_reply
#                 )
#         else:
#             messages.append({"role": "assistant", "content": main_reply})
#             # Теперь реально сохраняем в Redis
#             cache.set(redis_key, messages, timeout=24*3600)
#
#         # 5) Генерируем TTS (Coqui)
#         # Здесь мы не создаём временные файлы — сразу получаем base64
#         try:
#             audio_b64 = synthesize_speech_b64(main_reply)
#         except Exception as e:
#             return Response({
#                 "transcript": transcript,
#                 "assistant_text": main_reply,
#                 "error": f"TTS error: {str(e)}"
#             }, status=500)
#
#         # 6) Формируем ответ
#         response_data = {
#             "transcript": transcript,
#             "assistant_text": main_reply,
#             "assistant_audio_b64": audio_b64
#         }
#         # Если feedback_mode включён и действительно есть FEEDBACK
#         if feedback_mode and feedback_text:
#             response_data["feedback"] = feedback_text
#
#         return Response(response_data, status=200)
#
#     def build_gpt_messages(self, conversation: VoiceConversation):
#         """
#         Собираем список [{"role":"user/assistant","content":"..."}]
#         + если нет system, добавим.
#         """
#         msgs_db = conversation.messages.order_by('created_at')
#         gpt_messages = []
#         has_system = any(m.role == 'system' for m in msgs_db)
#
#         if not has_system:
#             gpt_messages.append({
#                 "role": "system",
#                 "content": (
#                     "You are an AI English tutor. "
#                     "If user has mistakes, append 'FEEDBACK: ...' at the end."
#                 )
#             })
#
#         for m in msgs_db:
#             gpt_messages.append({"role": m.role, "content": m.text})
#
#         return gpt_messages


# import os
# import tempfile
# import base64
# from django.utils import timezone
# from django.core.cache import cache
# from django.db import transaction
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from openai import OpenAI, OpenAIError
# from django.conf import settings
#
# from .models import VoiceConversation, VoiceMessage
# from .whisper_utils import transcribe_file
# from .coqui_tts import synthesize_speech_b64
# from subscriptions.utils import check_and_increment_requests
# from subscriptions.models import UserSubscription
#
# api_key = os.environ.get('OPENAI_API_KEY', None)
# client = OpenAI(api_key=api_key)
#
#
# def get_model_for_user(user):
#     if not user.is_authenticated:
#         return "gpt-3.5-turbo"
#     try:
#         sub = user.usersubscription
#     except UserSubscription.DoesNotExist:
#         return "gpt-3.5-turbo"
#
#     plan = sub.plan
#     if plan.allow_gpt4:
#         return "gpt-4"
#     return "gpt-3.5-turbo"
#
#
# # (A) Список тем
# class TopicListView(APIView):
#     def get(self, request):
#         topics = ["business", "travel", "doctor", "interview"]
#         return Response(topics)
#
#
# # (B) Начало беседы
# class StartConversationView(APIView):
#     """
#     POST /api/conversation/start/
#     body: {"topic":"business"}
#     """
#
#     def post(self, request):
#         topic = request.data.get('topic', "").strip()
#         if not topic:
#             return Response({"error": "No topic provided"}, status=400)
#
#         user = request.user
#         if user.is_authenticated:
#             conv = VoiceConversation.objects.create(
#                 user=user,
#                 topic=topic
#             )
#             # Добавим system
#             VoiceMessage.objects.create(
#                 conversation=conv,
#                 role="system",
#                 text=self.build_intro_for_topic(topic)
#             )
#             return Response({
#                 "conversation_id": conv.id,
#                 "message": f"New conversation started with topic={topic}"
#             })
#         else:
#             guest_id = request.COOKIES.get('guest_id', 'anon')
#             redis_key = f"conv_chat:{guest_id}"
#             system_msg = {"role": "system", "content": self.build_intro_for_topic(topic)}
#             cache.set(redis_key, [system_msg], timeout=24 * 3600)
#             return Response({
#                 "guest_id": guest_id,
#                 "message": f"Guest conversation started with topic={topic}"
#             })
#
#     def build_intro_for_topic(self, topic: str) -> str:
#         if topic == "business":
#             return ("You are an AI specialized in Business English. "
#                     "Speak formally, help with business dialogues. If user has mistakes, append 'FEEDBACK:'")
#         elif topic == "travel":
#             return ("You are an AI specialized in Travel English. "
#                     "Be a friendly travel assistant.")
#         elif topic == "doctor":
#             return ("You are an AI specialized in medical English conversation. "
#                     "Pretend you are a doctor speaking politely.")
#         elif topic == "interview":
#             return ("You are an AI specialized in job interview English. "
#                     "Be an interviewer. If user has mistakes, 'FEEDBACK:...'")
#
#         # fallback
#         return ("You are an AI English tutor. If user has mistakes, append 'FEEDBACK:...'")
#
#
# # (C) Отправка аудио
# class ConversationView(APIView):
#     """
#     POST /api/conversation/<conv_id>/
#       form-data: audio=@file.wav
#       optional: feedback=true/false
#     """
#
#     def post(self, request, conv_id=None):
#         if not check_and_increment_requests(request.user):
#             return Response({"error": "Limit reached. Upgrade or wait."}, status=403)
#
#         audio_file = request.FILES.get('audio')
#         if not audio_file:
#             return Response({"error": "No audio file provided"}, status=400)
#         if audio_file.size > 10 * 1024 * 1024:
#             return Response({"error": "Audio file too large"}, status=400)
#
#         feedback_mode = (request.data.get('feedback', 'true').lower() == 'true')
#
#         # (1) Сохраним во временный
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             for chunk in audio_file.chunks():
#                 tmp.write(chunk)
#             tmp_path = tmp.name
#
#         # (2) Whisper
#         try:
#             transcript = transcribe_file(tmp_path)
#         except Exception as e:
#             os.remove(tmp_path)
#             return Response({"error": f"Whisper error: {str(e)}"}, status=500)
#         finally:
#             if os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#
#         # (3) user.is_authenticated => BД, иначе Redis
#         if request.user.is_authenticated:
#             # Ищем conversation
#             try:
#                 conv = VoiceConversation.objects.get(pk=conv_id, user=request.user)
#             except VoiceConversation.DoesNotExist:
#                 return Response({"error": "Conversation not found"}, status=404)
#
#             with transaction.atomic():
#                 conv.total_messages += 1
#                 conv.save()
#                 VoiceMessage.objects.create(
#                     conversation=conv,
#                     role="user",
#                     text=transcript
#                 )
#             # GPT messages
#             messages = self.build_gpt_messages_db(conv)
#         else:
#             # Гость => Redis
#             guest_id = request.COOKIES.get('guest_id', 'anon')
#             redis_key = f"conv_chat:{guest_id}"
#             messages = cache.get(redis_key, [])
#             # добавляем user
#             messages.append({"role": "user", "content": transcript})
#
#         if len(messages) > 20:
#             # удаляем старое
#             # (не трогаем system, index=0)
#             messages.pop(1)
#
#         # (4) GPT
#         model_name = get_model_for_user(request.user)
#
#         try:
#             gpt_response = client.chat.completions.create(
#                 model=model_name,
#                 messages=messages
#             )
#             assistant_text = gpt_response.choices[0].message.content
#         except OpenAIError as e:
#             return Response({"transcript": transcript, "error": f"GPT error: {str(e)}"})
#         except Exception as e:
#             return Response({"transcript": transcript, "error": f"GPT error: {str(e)}"})
#
#         # feedback
#         feedback_text = None
#         if "FEEDBACK:" in assistant_text:
#             parts = assistant_text.split("FEEDBACK:")
#             main_reply = parts[0].strip()
#             feedback_text = parts[1].strip() if len(parts) > 1 else None
#         else:
#             main_reply = assistant_text
#
#         # сохраняем assistant
#         if request.user.is_authenticated:
#             with transaction.atomic():
#                 conv.total_messages += 1
#                 conv.save()
#                 VoiceMessage.objects.create(
#                     conversation=conv,
#                     role="assistant",
#                     text=main_reply
#                 )
#         else:
#             messages.append({"role": "assistant", "content": main_reply})
#             cache.set(redis_key, messages, 24 * 3600)
#
#         # (5) TTS
#         try:
#             audio_b64 = synthesize_speech_b64(main_reply)
#         except Exception as e:
#             return Response({
#                 "transcript": transcript,
#                 "assistant_text": main_reply,
#                 "error": f"TTS error: {str(e)}"
#             }, status=500)
#
#         # (6) Итог
#         resp_data = {
#             "transcript": transcript,
#             "assistant_text": main_reply,
#             "assistant_audio_b64": audio_b64,
#         }
#         if feedback_mode and feedback_text:
#             resp_data["feedback"] = feedback_text
#
#         return Response(resp_data, status=200)
#
#     def build_gpt_messages_db(self, conversation: VoiceConversation):
#         msgs_db = conversation.messages.order_by('created_at')
#         # Преобразуем
#         gpt_messages = []
#         for m in msgs_db:
#             gpt_messages.append({"role": m.role, "content": m.text})


############################################

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response

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
