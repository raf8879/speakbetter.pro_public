from django.urls import path
from .views_api import GamificationStatsView

urlpatterns = [
    path('my/', GamificationStatsView.as_view(), name='stats_my'),
]
