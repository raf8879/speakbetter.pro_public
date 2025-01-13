# from django.urls import path
# from .views import ChatView
#
# urlpatterns = [
#     path('', ChatView.as_view(), name='chat'),
# ]

# from django.urls import path
# from .views import (
#     ChatTopicsView,
#     ChatStartView,
#     ChatSendMessageView
# )
#
# urlpatterns = [
#     path('topics/', ChatTopicsView.as_view(), name='chat_topics'),
#     path('start/', ChatStartView.as_view(), name='chat_start'),
#     path('<str:topic>/', ChatSendMessageView.as_view(), name='chat_send_message'),
# ]
# chat/urls.py
from django.urls import path
from .views import (
    ChatTopicsView,
    ChatStartView,
    ChatTopicView,  # универсальный GET/POST
)

urlpatterns = [
    path('topics/', ChatTopicsView.as_view(), name='chat_topics'),
    path('start/', ChatStartView.as_view(), name='chat_start'),
    # GET/POST /api/chat/<topic>/ => читать/отправлять сообщения
    path('<str:topic>/', ChatTopicView.as_view(), name='chat_topic'),
]
