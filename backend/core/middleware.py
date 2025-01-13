import uuid
import datetime
from django.utils import timezone
from django.core.cache import cache
from django.http import JsonResponse


class GuestMiddleware:
    """
    Middleware для идентификации гостя и подсчёта запросов.
    Если пользователь не авторизован, генерируем guest_id и храним в cookie.
    Считаем запросы за сутки, если >10 - возвращаем ошибку.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Проверяем авторизацию
        user = request.user if hasattr(request, 'user') else None
        if user is not None and user.is_authenticated:
            # Авторизованный пользователь - без ограничений (пока)
            return self.get_response(request)

        # Неавторизованный пользователь (гость)
        guest_id = request.COOKIES.get('guest_id')
        if not guest_id:
            guest_id = str(uuid.uuid4())

        # Подсчёт запросов:
        today_str = timezone.now().strftime("%Y-%m-%d")
        key = f"guest_requests_count:{guest_id}:{today_str}"
        count = cache.get(key, 0)
        count += 1

        # Сохраняем новое значение
        # Можно установить TTL = конец суток или просто оставить
        cache.set(key, count, 86400)  # 1 день = 86400 секунд

        # if count > 250:
        #     return JsonResponse({"error": "Too many requests for guest"}, status=429)

        response = self.get_response(request)
        # Устанавливаем guest_id в cookie, если его не было
        if 'guest_id' not in request.COOKIES:
            response.set_cookie('guest_id', guest_id, max_age=86400 * 10)
            # max_age=86400*10 - хранить 10 дней cookie, чтобы гость не потерялся
        return response
