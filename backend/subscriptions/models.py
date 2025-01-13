#subscriptoin/view
from django.db import models
from django.conf import settings


class Plan(models.Model):
    """
    Определяем разные уровни подписок: free, premium, teacher и т.д.
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    # Можно хранить параметры (лимиты, доступ к GPT-4 и т.п.)
    max_requests_per_day = models.IntegerField(default=10000)  # пока большое число
    allow_gpt4 = models.BooleanField(default=False)           # в будущем активируем

    # Для MVP можно записать, что free = 10000 запросов, GPT4=False
    # premium = 100000 запросов, GPT4=True

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    """
    Привязка пользователя к плану.
    На этапе MVP все могут быть 'free'.
    В будущем - платное.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)  # нельзя удалять план, если есть подписчики
    # В будущем:
    # started_at = models.DateTimeField(auto_now_add=True)
    # expires_at = models.DateTimeField(null=True, blank=True)
    # auto_renew = models.BooleanField(default=False)
    # ...

    def __str__(self):
        return f"{self.user.username}: {self.plan.name}"
