from django.db import models
from django.conf import settings

LEVEL_CHOICES = [
    ("Beginner", "Beginner"),
    ("Intermediate", "Intermediate"),
    ("Advanced", "Advanced")
]
class PronunciationExercise(models.Model):
    """
    Упражнение (текст) для чтения.
    """
    title = models.CharField(max_length=200)
    level = models.CharField(max_length=15, choices=LEVEL_CHOICES, blank=True, default="A1")
    text = models.TextField()  # Эталонный текст для чтения
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.level})"


class PronunciationAttempt(models.Model):
    """
    Попытка чтения пользователем данного упражнения.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    exercise = models.ForeignKey(PronunciationExercise, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)  # Итоговая оценка (0..100)
    recognized_text = models.TextField(blank=True)  # Распознанный текст (Whisper)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attempt of {self.user} on {self.exercise.title} (score={self.score})"


class MispronouncedWord(models.Model):
    # Список неверно/неуверенно произнесённых слов.
    attempt = models.ForeignKey(PronunciationAttempt, on_delete=models.CASCADE, related_name='mispronounced_words')
    word = models.CharField(max_length=100)
    accuracy = models.FloatField(default=0.0)
    start_time = models.FloatField(default=0.0)  # время начала в аудио
    end_time = models.FloatField(default=0.0)    # время окончания в аудио

    def __str__(self):
        return f"[Att={self.attempt.id}] {self.word} (acc={self.accuracy:.2f})"


class MispronouncedWordGlobal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    word = models.CharField(max_length=100)
    accuracy = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    # Новые поля:
    reached_threshold_at = models.DateTimeField(null=True, blank=True)
    expire_after_minutes = models.PositiveIntegerField(default=5)


    class Meta:
        unique_together = ('user', 'word')

    def __str__(self):
        return f"{self.user.username} - {self.word} (acc={self.accuracy:.1f})"


