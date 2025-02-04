
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PasswordResetToken


class ResetPasswordView(APIView):

    def post(self, request):
        token_str = request.data.get("token")
        new_password = request.data.get("password")
        confirm_password = request.data.get("password_confirm")

        # 1) Проверяем входные данные
        if not token_str or not new_password or not confirm_password:
            return Response({"error": "token, password, and password_confirm are required"}, status=400)

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)

        # 2) Ищем токен
        try:
            reset_obj = PasswordResetToken.objects.get(token=token_str)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid or expired token"}, status=400)

        # 3) Проверяем is_valid
        if not reset_obj.is_valid():
            return Response({"error": "Token expired or already used"}, status=400)

        user = reset_obj.user

        # 4) Проверка надёжности пароля — используем встроенные валидаторы Django
        try:
            validate_password(new_password, user=user)
        except ValidationError as val_err:
            # Список ошибок → преобразуем в строку или отправляем списком
            return Response({"error": val_err.messages}, status=400)

        # 5) Применяем пароль
        user.set_password(new_password)
        user.save()

        # 6) Помечаем, что токен уже использован
        reset_obj.used = True
        reset_obj.save()

        return Response({"message": "Password has been reset. You can now login."}, status=status.HTTP_200_OK)
