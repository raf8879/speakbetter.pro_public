from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomCookieJWTAuthentication(JWTAuthentication):


    def authenticate(self, request):
        cookie_token = request.COOKIES.get("access_token", None)
        if cookie_token:
            # Проверим валидность
            raw_token = cookie_token
            validated_token = self.get_validated_token(raw_token)
            return (self.get_user(validated_token), validated_token)

        # иначе fallback
        return super().authenticate(request)
