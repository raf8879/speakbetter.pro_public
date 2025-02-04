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
