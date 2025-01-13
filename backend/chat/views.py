# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticatedOrReadOnly
# import os
# from openai import OpenAI
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from django.core.cache import cache
# from django.contrib.auth.models import User
# from django.conf import settings
# from django.utils import timezone
# from .models import ChatContext
# import os
# from subscriptions.models import UserSubscription
# from subscriptions.utils import check_and_increment_requests
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
# class ChatView(APIView):
#     """
#     View: POST запрос { "message": "..." }
#     Хранит контекст для авторизованного в БД (ChatContext),
#     для гостя - в Redis.
#     """
#     def post(self, request):
#         if not check_and_increment_requests(request.user):
#             return Response({"error": "Request limit reached. Please upgrade or wait."},
#                             status=403)
#         user_message = request.data.get('message', '')
#         if not user_message:
#             return Response({"error": "No message provided"}, status=400)
#
#         # openai.api_key = os.environ.get('OPENAI_API_KEY', None)
#         # if not openai.api_key:
#         #     return Response({"error": "OpenAI key missing."}, status=500)
#
#         if request.user.is_authenticated:
#             # Авторизованный пользователь
#             chat_context, _ = ChatContext.objects.get_or_create(user=request.user)
#             messages = chat_context.messages
#         else:
#             # Гость
#             guest_id = request.COOKIES.get('guest_id')
#             if not guest_id:
#                 return Response({"error": "Guest ID missing"}, status=400)
#             # Забираем контекст из Redis
#             redis_key = f'guest_chat:{guest_id}'
#             messages = cache.get(redis_key, [])
#
#         has_system = any(msg.get("role") == "system" for msg in messages)
#         if not has_system:
#             system_msg = {
#                 "role": "system",
#                 "content": (
#                     "You are an AI English tutor. Help the user improve their English. "
#                     "Correct grammar mistakes, suggest better vocabulary, and give helpful tips."
#                 )
#             }
#             messages.insert(0, system_msg)
#         # Добавляем новое сообщение пользователя
#         messages.append({"role": "user", "content": user_message})
#         # Обрезаем, если более 20
#         if len(messages) > 20:
#             messages.pop(1)
#
#         # Отправляем запрос к OpenAI, включая весь контекст
#         try:
#             model_name = get_model_for_user(request.user)
#             print("DEBUG: about to call client.chat.completions.create(...)")
#             response = client.chat.completions.create(
#                 model=model_name,
#                 messages=messages
#             )
#             assistant_reply = response.choices[0].message.content
#             print("DEBUG response:", response)  # Посмотрим, что вернул client
#             print("DEBUG assistant_reply:", assistant_reply)
#
#             # Добавляем ответ модели
#             messages.append({"role": "assistant", "content": assistant_reply})
#             if len(messages) > 20:
#                 messages.pop(1)
#
#                 # Сохраняем контекст
#             if request.user.is_authenticated:
#                 chat_context.messages = messages
#                 chat_context.save()
#             else:
#                 cache.set(redis_key, messages, timeout=60*60*24)  # например, 1 день
#
#             return Response({"reply": assistant_reply})
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from django.core.cache import cache
# from django.db import transaction
# from django.conf import settings
# from django.utils import timezone
# from rest_framework import status
# import os
#
# from .models import ChatRoom
# from subscriptions.utils import check_and_increment_requests
# from subscriptions.models import UserSubscription
# from openai import OpenAI, OpenAIError
#
# # Зададим OPENAI_API_KEY
# api_key = os.environ.get('OPENAI_API_KEY')
# client = OpenAI(api_key=api_key)
#
# AVAILABLE_TOPICS = ["past", "present", "future"]  # Три темы
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
# class ChatTopicsView(APIView):
#     """
#     GET /api/chat/topics/
#     Возвращает ["past","present","future"]
#     """
#     def get(self, request):
#         return Response(AVAILABLE_TOPICS)
#
#
# class ChatStartView(APIView):
#     """
#     POST /api/chat/start/
#     body: {"topic":"past"}
#
#     Идея:
#     1) Если user.is_authenticated, ищем/создаём ChatRoom(user, topic).
#     2) Инициализируем system-сообщение (или, если уже было, не трогаем).
#     3) Для гостя -> Redis, ключ: chat_{guest_id}:{topic}.
#     """
#     def post(self, request):
#         if not check_and_increment_requests(request.user):
#             return Response({"error":"Limit reached"}, status=403)
#
#         topic = request.data.get("topic","").strip()
#         if topic not in AVAILABLE_TOPICS:
#             return Response({"error":"Invalid topic"}, status=400)
#
#         if request.user.is_authenticated:
#             # Ищем/создаём
#             room, created = ChatRoom.objects.get_or_create(
#                 user=request.user,
#                 topic=topic,
#                 defaults={"messages":[]}
#             )
#             # Если создана впервые, добавим system:
#             if created or len(room.messages)==0:
#                 system_msg = {
#                     "role": "system",
#                     "content": f"You are an AI specialized in {topic} tense. "
#                                f"Help with grammar in {topic} tense. Correct mistakes, etc."
#                 }
#                 room.messages.insert(0, system_msg)
#                 room.save()
#
#             return Response({
#                 "topic": topic,
#                 "created": created,
#                 "message": f"Chat with topic={topic} is ready"
#             })
#
#         else:
#             # Гость
#             guest_id = request.COOKIES.get('guest_id','')
#             if not guest_id:
#                 return Response({"error":"No guest_id cookie"}, status=400)
#
#             redis_key = f"chat_guest:{guest_id}:{topic}"
#             msgs = cache.get(redis_key, [])
#             if len(msgs)==0:
#                 # Добавим system
#                 system_msg = {
#                     "role":"system",
#                     "content": f"You are an AI specialized in {topic} tense..."
#                 }
#                 msgs.insert(0, system_msg)
#                 cache.set(redis_key, msgs, 24*3600)
#
#             return Response({
#                 "topic": topic,
#                 "message": f"Guest chat started for topic={topic}"
#             })
#
#
# class ChatSendMessageView(APIView):
#     """
#     POST /api/chat/<topic>/
#     body: {"message":"..."}
#     Логика:
#     1) Ищем ChatRoom по (user, topic) или redis.
#     2) Добавляем user-сообщение -> GPT -> assistant -> сохраняем -> возвращаем assistant
#     """
#     def post(self, request, topic=None):
#         if not check_and_increment_requests(request.user):
#             return Response({"error":"Limit reached"}, status=403)
#
#         if topic not in AVAILABLE_TOPICS:
#             return Response({"error":"Invalid topic"}, status=400)
#
#         user_message = request.data.get('message',"").strip()
#         if not user_message:
#             return Response({"error":"No message"}, status=400)
#
#         model_name = get_model_for_user(request.user)
#
#         # Авторизованный
#         if request.user.is_authenticated:
#             try:
#                 room = ChatRoom.objects.get(user=request.user, topic=topic)
#             except ChatRoom.DoesNotExist:
#                 return Response({"error":"No such chat for this user & topic"}, status=404)
#
#             # Добавляем user
#             room.messages.append({"role":"user","content":user_message})
#             # Ограничиваем длину
#             if len(room.messages)>20:
#                 room.messages.pop(1)
#
#             # GPT
#             try:
#                 response = client.chat.completions.create(
#                     model=model_name,
#                     messages=room.messages
#                 )
#                 assistant_text = response.choices[0].message.content
#             except OpenAIError as e:
#                 return Response({"error":f"GPT error: {str(e)}"}, status=500)
#
#             # Добавляем assistant
#             room.messages.append({"role":"assistant","content":assistant_text})
#             if len(room.messages)>20:
#                 room.messages.pop(1)
#
#             room.save()
#
#             return Response({"reply": assistant_text})
#
#         else:
#             # Гость
#             guest_id = request.COOKIES.get('guest_id','')
#             if not guest_id:
#                 return Response({"error":"No guest_id"}, status=400)
#
#             redis_key = f"chat_guest:{guest_id}:{topic}"
#             msgs = cache.get(redis_key, [])
#
#             msgs.append({"role":"user","content":user_message})
#             if len(msgs)>20:
#                 msgs.pop(1)
#
#             # GPT
#             try:
#                 response = client.chat.completions.create(
#                     model=model_name,
#                     messages=msgs
#                 )
#                 assistant_text = response.choices[0].message.content
#             except OpenAIError as e:
#                 return Response({"error":f"GPT error: {str(e)}"}, status=500)
#
#             msgs.append({"role":"assistant","content":assistant_text})
#             if len(msgs)>20:
#                 msgs.pop(1)
#
#             cache.set(redis_key, msgs, 24*3600)
#
#             return Response({"reply": assistant_text})
# chat/views.py
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
