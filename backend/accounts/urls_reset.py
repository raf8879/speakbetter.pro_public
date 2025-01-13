#
# # accounts/urls_reset.py
# from django.urls import path
# from .views_reset import ResetPasswordView
# from .views import RequestResetPasswordView
#
# urlpatterns = [
#     path('password-reset/', RequestResetPasswordView.as_view(), name='password_reset'),
#     path('password-reset/confirm/', ResetPasswordView.as_view(), name='password_reset_confirm'),
# ]
#
# # Затем в основном urls.py:
# # path('api/auth/', include('accounts.urls_reset')), ...
