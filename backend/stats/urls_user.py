# # stats/urls_user.py
# from django.urls import path
# from .views_user import UserStatsView
#
# urlpatterns = [
#     path('', UserStatsView.as_view(), name='user_stats'),
# ]
# stats/urls_api.py
from django.urls import path
from .views_api import GamificationStatsView

urlpatterns = [
    path('my/', GamificationStatsView.as_view(), name='stats_my'),
]
