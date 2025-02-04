from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model


User = get_user_model()


class DeleteAccountView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
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
        user.delete()

        # 2) Формируем ответ
        return Response(
            {"detail": "Account has been deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
