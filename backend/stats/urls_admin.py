# stats/urls_admin.py
from django.urls import path
from .views_admin import AdminStatsView

urlpatterns = [
    path('', AdminStatsView.as_view(), name='admin_stats'),
]
