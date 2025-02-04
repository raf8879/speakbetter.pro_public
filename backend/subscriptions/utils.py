from django.core.cache import cache


def check_and_increment_requests(user):

    # if not user.is_authenticated:
    #     return True
    if not user.is_authenticated:
        # сейчас "return True"
        # Вы хотите ограничить неавторизованным, скажем 10 раз/сутки
        key = "guest_requests_today"  # or per IP?
        current = cache.get(key, 0)
        if current >= 100:
            return False
        # increment
        cache.set(key, current + 1, 24 * 3600)
        return True

    sub = getattr(user, 'usersubscription', None)
    if not sub:
        return True

    plan = sub.plan
    limit = plan.max_requests_per_day

    key = f"user:{user.id}:requests_today"
    current_requests = cache.get(key)  # вернёт None, если ключа нет

    if current_requests is None:
        # Значит ключ в Redis отсутствует, создадим со значением 0
        cache.set(key, 0, timeout=86400)  # на сутки или сколько надо
        current_requests = 0

    if current_requests >= limit:
        return False

    # теперь безопасно
    cache.incr(key, 1)
    return True


