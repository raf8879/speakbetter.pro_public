# accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomCookieJWTAuthentication(JWTAuthentication):
    """
    1) Пытается достать access-токен из HTTP-only куки 'access_token'.
    2) Если не находит - fallback на стандартный заголовок Authorization.
    """

    def authenticate(self, request):
        cookie_token = request.COOKIES.get("access_token", None)
        if cookie_token:
            # Проверим валидность
            raw_token = cookie_token
            validated_token = self.get_validated_token(raw_token)
            return (self.get_user(validated_token), validated_token)

        # иначе fallback
        return super().authenticate(request)
