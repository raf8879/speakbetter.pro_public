# from django.urls import path
# from .views import PronunciationAttemptView, ListenWordView
#
# urlpatterns = [
#     path('<int:exercise_id>/attempt/', PronunciationAttemptView.as_view(), name='pronunciation_attempt'),
#     path('word-audio/', ListenWordView.as_view(), name='pronunciation_word_audio'),
# ]


from django.urls import path
from .views import (
    PronunciationLevelsView,
    ExerciseListView, ExerciseDetailView,
    PronunciationAttemptView,
    PronunciationStatsView,
    # MispronouncedWordsView,
    WordTrainingView,
    MispronouncedWordGlobalView,
    ListenWordView,
    # WordRemoveView,
)
# Если у вас ListenWordView (TTS) — добавьте

urlpatterns = [
    # Список уровней: A1..C3
    path('levels/', PronunciationLevelsView.as_view(), name='pronunciation_levels'),

    # /api/pronunciation/exercises/?level=B1
    path('exercises/', ExerciseListView.as_view(), name='exercise_list'),
    # /api/pronunciation/exercises/5/
    path('exercises/<int:pk>/', ExerciseDetailView.as_view(), name='exercise_detail'),

    # /api/pronunciation/<exercise_id>/attempt/  (POST audio)
    path('<int:exercise_id>/attempt/', PronunciationAttemptView.as_view(), name='pronunciation_attempt'),

    # Статистика
    # path('stats/', PronunciationStatsView.as_view(), name='pronunciation_stats'),
    path('miswords/', MispronouncedWordGlobalView.as_view(), name='miswords_list'),
    path('word-training/', WordTrainingView.as_view(), name='word_training'),
    path('word-audio/', ListenWordView.as_view(), name='word-audio'),
    # path('miswords/<str:word>/', WordRemoveView.as_view(), name='misword_remove'),
]
