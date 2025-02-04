from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from accounts.views import CustomTokenObtainPairView, CustomTokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/', include('accounts.urls')),
    path('api/exercises/', include('exercises.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/conversation/', include('conversation.urls')),
    path('api/pronunciation/', include('pronunciation.urls')),
    path('api/stats/', include('stats.urls_user')),
    path('api/stats/rafa/', include('stats.urls_admin')),
]
