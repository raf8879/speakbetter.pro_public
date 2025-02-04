from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings
from rest_framework import status
from django.utils import timezone
from .models import EmailConfirmation  # ← импорт вашей новой модели
from .serializers import UserProfileSerializer  # если нужно
from subscriptions.models import Plan, UserSubscription



User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")

        if not username or not password or not email:
            return Response({"error": "username, password, email are required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already in use"}, status=400)

        # Создаем пользователя c is_active=False
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_active=False
        )

        confirm_obj = EmailConfirmation.objects.create(user=user)
        token = str(confirm_obj.token)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://speakbetter.pro')
        verify_link = f"{frontend_url}/verify-email?token={token}"

        # Отправляем email
        subject = "Confirm your registration"
        message = f"Hi {username}!\nClick the link to confirm your email:\n{verify_link}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]

        try:
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        except Exception as e:
            # Если SMTP недоступен, вы можете захотеть удалить user или оставить?
            print("Send mail error:", e)

        return Response(
            {"message": "User created. Please check your email for confirmation link."},
            status=201
        )

class VerifyEmailView(APIView):
    """
    POST /api/auth/verify-email/
    body: { "token": "..." }
    Или GET, если удобнее
    """

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "No token provided"}, status=400)


        try:
            confirm = EmailConfirmation.objects.get(token=token)
        except EmailConfirmation.DoesNotExist:
            return Response({"error": "Invalid or expired token"}, status=400)


        if confirm.confirmed_at:
            return Response({"message": "Already confirmed"}, status=200)


        user = confirm.user
        user.is_active = True
        user.save()

        confirm.confirmed_at = timezone.now()
        confirm.save()

        return Response({"message": "Email verified! You can now login."}, status=200)


class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_scope = 'login'
    """
    POST /api/token/   body: { "username":"...", "password":"..." }
    Возвращает:
      - 200 + куки (access_token, refresh_token), httponly
      - body: { "detail":"Login successful" }
    """
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)  # стандартная логика
        if response.status_code == 200:
            data = response.data
            access_token = data["access"]
            refresh_token = data["refresh"]

            # 1) чистим из body:
            response.data = {"detail": "Login successful"}

            # 2) куки
            # Пример: secure=True (если HTTPS), samesite="None" (если cross-domain)
            # max_age = ACCESS_TOKEN_LIFETIME (в секундах)
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                max_age=10 * 60,  # 10 мин
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                max_age=24 * 3600,  # 1 день
            )
        return response



class CustomTokenRefreshView(TokenRefreshView):
    """
    POST /api/token/refresh/
    body: { "refresh":"..." }
      - но можно достать из куки refresh_token, если не пришёл в body.
    Выдаёт новый access_token (меняется в куке).
    Если ROTATE_REFRESH_TOKENS=True, может выдать новый refresh-токен.
    """
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        # если в body нет refresh, пробуем достать из куки
        if "refresh" not in request.data:
            cookie_refresh = request.COOKIES.get("refresh_token", None)
            if cookie_refresh:
                request.data["refresh"] = cookie_refresh

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Если всё ОК, значит есть новый access
            # возможно и новый refresh
            new_access = response.data["access"]
            # Заменяем body на нечто простое
            refresh_cookie = None
            if "refresh" in response.data:
                refresh_cookie = response.data["refresh"]

            response.data = {"detail": "Token refreshed"}

            # Кладём новый access в куку
            response.set_cookie(
                "access_token",
                new_access,
                httponly=True,
                secure=True,
                samesite='None',
                max_age=10 * 60,
            )
            if refresh_cookie:
                # если refresh тоже новый (rotation on)
                response.set_cookie(
                    "refresh_token",
                    refresh_cookie,
                    httponly=True,
                    secure=True,
                    samesite='None',
                    max_age=24 * 3600,
                )
        return response



class LogoutView(APIView):
    """
    POST /api/auth/logout/
    - стираем куки
    - (опционально: блэклистим текущий refresh_token)
    """
    def post(self, request):
        # если хотим блэклистить refresh -> нужно его достать
        cookie_refresh = request.COOKIES.get("refresh_token", None)
        if cookie_refresh:
            try:
                token = RefreshToken(cookie_refresh)
                # помечаем его в блэклисте
                token.blacklist()
            except TokenError:
                pass

        response = Response({"detail": "Logged out"}, status=200)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response



class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            # и т.д.
        }, status=200)


from rest_framework.decorators import api_view
from .models import PasswordResetToken
@api_view(["GET"])
def debug_cookies(request):
    # Посмотреть, какие cookies Django видит
    return Response({
        "cookies": request.COOKIES
    })



class RequestResetPasswordView(APIView):
    """
    POST /api/auth/password-reset/
    body: { "email": "..." }

    Генерация одноразового токена сброса пароля,
    отправка письма со ссылкой вида:
      FRONTEND_URL + "/reset-password?token=<UUID>"
    """
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)


        safe_response = {"message": "If the account exists, a reset link has been sent."}

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Не выдаём, что email не найден.
            return Response(safe_response, status=200)

        reset_obj = PasswordResetToken.objects.create(user=user)
        reset_url = f"http://speakbetter.pro/reset-password?token={reset_obj.token}"


        subject = "Reset your password"
        message = (
            f"Hello {user.username}!\n\n"
            f"To reset your password, click the link below (valid for 30 min):\n"
            f"{reset_url}\n\n"
            f"If you didn't request a reset, ignore this email."
        )

        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]

        try:
            send_mail(subject, message, from_email, recipient_list)
        except Exception as e:
            # В реальном проекте логируйте ошибку
            print("Send mail error:", e)

        return Response(safe_response, status=200)

