from django.urls import path
from .views import (
    PronunciationLevelsView,
    ExerciseListView, ExerciseDetailView,
    PronunciationAttemptView,
    WordTrainingView,
    MispronouncedWordGlobalView,
    ListenWordView,
)


urlpatterns = [
    path('levels/', PronunciationLevelsView.as_view(), name='pronunciation_levels'),

    path('exercises/', ExerciseListView.as_view(), name='exercise_list'),
    path('exercises/<int:pk>/', ExerciseDetailView.as_view(), name='exercise_detail'),
    path('<int:exercise_id>/attempt/', PronunciationAttemptView.as_view(), name='pronunciation_attempt'),
    path('miswords/', MispronouncedWordGlobalView.as_view(), name='miswords_list'),
    path('word-training/', WordTrainingView.as_view(), name='word_training'),
    path('word-audio/', ListenWordView.as_view(), name='word-audio'),
]
