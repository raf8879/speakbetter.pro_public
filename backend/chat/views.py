import os
from django.core.cache import cache
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

from openai import OpenAI, OpenAIError

from subscriptions.utils import check_and_increment_requests
from subscriptions.models import UserSubscription
from .models import ChatRoom
from stats.models import EventLog
api_key = os.environ.get('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

AVAILABLE_TOPICS = ["past", "present", "future"]

def get_model_for_user(user):
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


class ChatTopicsView(APIView):
    """
    GET /api/chat/topics/
    Возвращает ["past","present","future"]
    """
    def get(self, request):
        return Response(AVAILABLE_TOPICS)


class ChatStartView(APIView):
    """
    POST /api/chat/start/
    body: {"topic":"past"}
    1) Если user.is_authenticated => создаём/находим ChatRoom
       - если новый => вставляем system + приветственное assistant-сообщение
    2) Если гость => в Redis, аналогично
    """
    def post(self, request):
        if not check_and_increment_requests(request.user):
            return Response({"error": "Limit reached"}, status=403)

        topic = request.data.get("topic", "").strip()
        if topic not in AVAILABLE_TOPICS:
            return Response({"error": "Invalid topic"}, status=400)

        if request.user.is_authenticated:
            room, created = ChatRoom.objects.get_or_create(
                user=request.user,
                topic=topic,
                defaults={"messages": []}
            )
            if created or len(room.messages) == 0:
                # system
                system_msg = {
                    "role": "system",
                    "content": f"You are an AI specialized in {topic} tense. Correct grammar, help user, etc."
                }
                room.messages.insert(0, system_msg)
                # привет от assistant
                assistant_msg = {
                    "role": "assistant",
                    "content": f"Hello! You chose the '{topic}' tense practice. How can I help you today?"
                }
                room.messages.append(assistant_msg)
                room.save()

            return Response({
                "topic": topic,
                "created": created,
                "message": f"Chat with topic={topic} is ready"
            })

        else:
            # Гость
            guest_id = request.COOKIES.get('guest_id', '')
            if not guest_id:
                return Response({"error": "No guest_id cookie"}, status=400)

            redis_key = f"chat_guest:{guest_id}:{topic}"
            msgs = cache.get(redis_key, [])

            if len(msgs) == 0:
                # Добавим system + привет
                system_msg = {
                    "role": "system",
                    "content": f"You are an AI specialized in {topic} tense..."
                }
                assistant_msg = {
                    "role": "assistant",
                    "content": f"Hello, guest user! This is '{topic}' tense practice. Let me help you."
                }
                msgs = [system_msg, assistant_msg]
                cache.set(redis_key, msgs, 24 * 3600)

            return Response({
                "topic": topic,
                "message": f"Guest chat started for topic={topic}"
            })


class ChatTopicView(APIView):
    """
    GET /api/chat/<topic>/ => вернуть все сообщения
    POST /api/chat/<topic>/ => отправить user-сообщение, GPT => assistant
    """
    def get(self, request, topic=None):
        if topic not in AVAILABLE_TOPICS:
            return Response({"error": "Invalid topic"}, status=400)

        if request.user.is_authenticated:
            try:
                room = ChatRoom.objects.get(user=request.user, topic=topic)
            except ChatRoom.DoesNotExist:
                return Response({"messages": []})  # пустой
            return Response({"messages": room.messages})
        else:
            guest_id = request.COOKIES.get('guest_id','')
            if not guest_id:
                return Response({"error":"No guest_id"}, status=400)

            redis_key = f"chat_guest:{guest_id}:{topic}"
            msgs = cache.get(redis_key, [])
            return Response({"messages": msgs})

    def post(self, request, topic=None):
        """
        body: { "message": "Hi there" }
        Возвращает {"reply": "..."}
        """
        if not check_and_increment_requests(request.user):
            return Response({"error": "Limit reached"}, status=403)

        if topic not in AVAILABLE_TOPICS:
            return Response({"error": "Invalid topic"}, status=400)

        user_message = request.data.get("message", "").strip()
        if not user_message:
            return Response({"error": "No message"}, status=400)

        model_name = get_model_for_user(request.user)

        # Авторизованный
        if request.user.is_authenticated:
            EventLog.objects.create(
                user=request.user,
                event_type="enter_chat"
            )
            try:
                room = ChatRoom.objects.get(user=request.user, topic=topic)
            except ChatRoom.DoesNotExist:
                return Response({"error": "No chat found for this topic"}, status=404)

            # Добавляем user
            room.messages.append({"role":"user","content": user_message})
            if len(room.messages) > 20:
                room.messages.pop(1)

            # GPT
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=room.messages,
                    max_tokens=150
                )
                assistant_text = response.choices[0].message.content
            except OpenAIError as e:
                return Response({"error": f"GPT error: {str(e)}"}, status=500)

            # Добавляем assistant
            room.messages.append({"role":"assistant","content": assistant_text})
            if len(room.messages) > 20:
                room.messages.pop(1)

            room.save()
            return Response({"reply": assistant_text})

        else:
            # Гость
            guest_id = request.COOKIES.get('guest_id','')
            if not guest_id:
                return Response({"error": "No guest_id"}, status=400)

            redis_key = f"chat_guest:{guest_id}:{topic}"
            msgs = cache.get(redis_key, [])

            msgs.append({"role":"user", "content": user_message})
            if len(msgs) > 20:
                msgs.pop(1)

            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=msgs
                )
                assistant_text = response.choices[0].message.content
            except OpenAIError as e:
                return Response({"error": f"GPT error: {str(e)}"}, status=500)

            msgs.append({"role":"assistant","content": assistant_text})
            if len(msgs) > 20:
                msgs.pop(1)

            cache.set(redis_key, msgs, 24 * 3600)

            return Response({"reply": assistant_text})
