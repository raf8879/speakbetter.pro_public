from django.urls import path
from .views import ExerciseStatsView

urlpatterns = [
    path('stats/', ExerciseStatsView.as_view(), name='exercise_stats'),
]
