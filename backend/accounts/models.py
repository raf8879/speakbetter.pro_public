from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import timedelta

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('teacher', 'Teacher'),
        ('student', 'Student')
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')


from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class EmailConfirmation(models.Model):
    """
    Храним связь User ↔ token для подтверждения email
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='email_confirmations'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True)  # уникальный токен
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    # Можно хранить срок действия: expires_at, если хотите
    # expires_at = models.DateTimeField(...)

    def __str__(self):
        return f"EmailConfirmation for {self.user} token={self.token}"


# models.py
# accounts/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid

class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self, lifetime_minutes=30):
        """
        Проверяем: token не использован, не просрочен.
        lifetime_minutes=30 — время жизни токена (минут).
        """
        if self.used:
            return False
        return timezone.now() < (self.created_at + timedelta(minutes=lifetime_minutes))

    def __str__(self):
        return f"PasswordResetToken for {self.user}, used={self.used}"
