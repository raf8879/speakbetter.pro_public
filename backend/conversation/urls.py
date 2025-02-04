from .views import ConversationView
from django.urls import path
from .views import (
    TopicListView,
    StartConversationView,
    ConversationView,
    GetConversationHistoryView,
)

urlpatterns = [
    path('topics/', TopicListView.as_view(), name='conversation_topics'),
    path('start/', StartConversationView.as_view(), name='conversation_start'),
    path('<int:conv_id>/', ConversationView.as_view(), name='conversation_detail'),
    path('<int:conv_id>/history/', GetConversationHistoryView.as_view(), name='conversation_history'),
]

