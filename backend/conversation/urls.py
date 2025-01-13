from django.urls import path
from .views import ConversationView

# urlpatterns = [
#     path('', ConversationView.as_view(), name='conversation')
# ]

# conversation/urls.py

# from django.urls import path
# from .views import (
#     ConversationView,
#     TopicListView,
#     StartConversationView,
# )
#
# urlpatterns = [
#     # POST /api/conversation/<conv_id>/ => отправить аудио
#     path('<int:conv_id>/', ConversationView.as_view(), name='conversation_detail'),
#
#     # GET /api/conversation/topics/ => список тем
#     path('topics/', TopicListView.as_view(), name='conversation_topics'),
#
#     # POST /api/conversation/start/ => начинаем новую беседу
#     path('start/', StartConversationView.as_view(), name='conversation_start'),
# ]

# conversation/urls.py
from django.urls import path
from .views import (
    TopicListView,
    StartConversationView,
    ConversationView,
    GetConversationHistoryView,
)

urlpatterns = [
    # GET /api/conversation/topics/
    path('topics/', TopicListView.as_view(), name='conversation_topics'),

    # POST /api/conversation/start/  (topic="...")
    path('start/', StartConversationView.as_view(), name='conversation_start'),

    # POST /api/conversation/<conv_id>/
    path('<int:conv_id>/', ConversationView.as_view(), name='conversation_detail'),

    # GET /api/conversation/<conv_id>/history/   (если нужно)
    path('<int:conv_id>/history/', GetConversationHistoryView.as_view(), name='conversation_history'),
]

