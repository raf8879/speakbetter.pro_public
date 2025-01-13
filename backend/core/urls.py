"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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
    path('api/auth/', include('accounts.urls')), #has register only
    path('api/exercises/', include('exercises.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/conversation/', include('conversation.urls')),
    path('api/pronunciation/', include('pronunciation.urls')),
    # path('api/stats/user/', include('stats.urls_user')),
    path('api/stats/', include('stats.urls_user')),
    path('api/stats/rafa/', include('stats.urls_admin')),
    # path('api/auth/', include('accounts.urls_reset')),
]

# urlpatterns = [
#     path('admin/', admin.site.urls),
#
#     # SimpleJWT стандартный
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'), # опционально
#
#     # Ваши приложения
#     path('api/exercises/', include('exercises.urls')),
#     path('api/chat/', include('chat.urls')),
#     path('api/auth/', include('accounts.urls')),  # тут лежат register/login/logout
#     path('api/conversation/', include('conversation.urls')),
#     path('api/pronunciation/', include('pronunciation.urls')),
# ]