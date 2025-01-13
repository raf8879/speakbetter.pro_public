from django.urls import path
from .views import RegisterView, MeView, VerifyEmailView, LogoutView, debug_cookies
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views_reset import ResetPasswordView
from .views import RequestResetPasswordView
from .views_delete import DeleteAccountView
# urlpatterns = [
#     path('register/', RegisterView.as_view(), name='register'),
#     path('login/', LoginView.as_view(), name='login'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('logout/', LogoutView.as_view(), name='logout'),
#     path('verify/', TokenVerifyView.as_view(), name='token_verify'),
# ]
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('debug-cookies/', debug_cookies),
    path('password-reset/', RequestResetPasswordView.as_view(), name='password_reset'),
    path('password-reset/confirm/', ResetPasswordView.as_view(), name='password_reset_confirm'),
    path('delete-account/', DeleteAccountView.as_view(), name="delete-account"),
]
