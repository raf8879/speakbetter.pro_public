from django.db import models
from django.conf import settings


class EventLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)  # 'login', 'enter_pronunciation', ...
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.event_type} - {self.timestamp}"


class UserProgress(models.Model):
    """
    Храним прогресс пользователя: XP (очки), возможно и другие поля
    (например, уровень, rank).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    xp = models.PositiveIntegerField(default=0)
    # Если нужны дополнительные поля, например rank/level, add them

    def __str__(self):
        return f"Progress of {self.user.username}: xp={self.xp}"


class Achievement(models.Model):
    """
    Справочник ачивок.
    Поле xp_threshold = порог XP, при достижении которого ачивка разблокируется
    (или иной критерий).
    """
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    xp_threshold = models.PositiveIntegerField(default=100)

    # Можно добавить порядок выдачи, тип (hidden/visible) и т.д.
    def __str__(self):
        return f"{self.code} ({self.xp_threshold} xp)"


class UnlockedAchievement(models.Model):
    """
    Связь: у конкретного пользователя (UserProgress) разблокирована
    конкретная ачивка (Achievement).
    """
    user_progress = models.ForeignKey(
        UserProgress,
        on_delete=models.CASCADE,
        related_name='unlocked_achievements'
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE
    )
    unlocked_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user_progress', 'achievement')

    def __str__(self):
        return f"{self.user_progress.user.username} unlocked {self.achievement.code}"


