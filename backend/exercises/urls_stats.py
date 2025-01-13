# exercises/urls_stats.py (или вместе с вашим router)
from django.urls import path
from .views import ExerciseStatsView

urlpatterns = [
    path('stats/', ExerciseStatsView.as_view(), name='exercise_stats'),
]
