# accounts/views_delete.py

from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

User = get_user_model()


class DeleteAccountView(APIView):
    """
    Удаление (hard delete) аккаунта текущего аутентифицированного пользователя.
    Доступ: только авторизованным.

    DELETE /api/auth/delete-account/
    (Опционально: в body можно передать "password" для подтверждения.)
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user

        # --- (Опциональная проверка пароля) ---
        # Для повышения безопасности: пользователь должен ввести текущий пароль.
        # Если не хотите проверять пароль, уберите этот блок.
        password = request.data.get("password")
        if not password:
            return Response(
                {"detail": "Password is required to confirm account deletion."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Invalid password. Account not deleted."},
                status=status.HTTP_403_FORBIDDEN
            )
        # --- конец проверки пароля ---

        # 1) Удаляем пользователя из базы (hard delete).
        # Если нужно «мягкое удаление», вместо user.delete() сделайте user.is_active=False, etc.
        user.delete()

        # 2) Формируем ответ
        return Response(
            {"detail": "Account has been deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
