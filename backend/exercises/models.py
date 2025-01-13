from django.db import models
from django.conf import settings


# class Exercise(models.Model):
#     EXERCISE_TYPE_CHOICES = [
#         ('reading', 'Reading'),
#         ('editing', 'Editing')
#     ]
#
#     title = models.CharField(max_length=255)
#     text = models.TextField()
#     level = models.CharField(max_length=10, blank=True, null=True)
#     exercise_type = models.CharField(max_length=20, choices=EXERCISE_TYPE_CHOICES, default='reading')
#     creator = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         null=True, on_delete=models.SET_NULL,
#         related_name='created_exercises'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return self.title


# LEVEL_CHOICES = [
#     ("Beginner", "Beginner"),
#     ("Intermediate", "Intermediate"),
#     ("Advanced", "Advanced"),
# ]
#
#
# class Exercise(models.Model):
#     EXERCISE_TYPE_CHOICES = [
#         ('reading', 'Reading'),
#         ('editing', 'Editing')
#     ]
#
#     title = models.CharField(max_length=255)
#     text = models.TextField()
#     level = models.CharField(
#         max_length=15,
#         choices=LEVEL_CHOICES,
#         blank=True,
#         default='Beginner'
#     )
#     exercise_type = models.CharField(
#         max_length=20,
#         choices=EXERCISE_TYPE_CHOICES,
#         default='reading'
#     )
#     creator = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         null=True, on_delete=models.SET_NULL,
#         related_name='created_exercises'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.title} ({self.level})"
#
#
# # exercises/models.py
# class ExerciseAttempt(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='exercise_attempts'
#     )
#     exercise = models.ForeignKey(
#         Exercise,
#         on_delete=models.CASCADE,
#         related_name='attempts'
#     )
#     score = models.FloatField(default=0.0)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     # Если хотите хранить какие-то детали (например, ошибки), добавляйте JSONField
#     # from django.db import models
#     # import jsonfield
#     # details = models.JSONField(blank=True, null=True)
#
#     def __str__(self):
#         return f"Attempt of {self.user} on {self.exercise.title} (score={self.score})"

# exercises/models.py
from django.db import models
from django.conf import settings

LEVEL_CHOICES = [
    ("Beginner", "Beginner"),
    ("Intermediate", "Intermediate"),
    ("Advanced", "Advanced"),
]

class Exercise(models.Model):
    EXERCISE_TYPE_CHOICES = [
        ('reading', 'Reading'),   # просто чтение
        ('editing', 'Editing'),   # fill-in-the-blanks
    ]

    title = models.CharField(max_length=255)
    text = models.TextField()  # Текст, в котором могут быть заглушки или нет
    level = models.CharField(
        max_length=15,
        choices=LEVEL_CHOICES,
        blank=True,
        default='Beginner'
    )
    exercise_type = models.CharField(
        max_length=20,
        choices=EXERCISE_TYPE_CHOICES,
        default='reading'
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, on_delete=models.SET_NULL,
        related_name='created_exercises'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.level}, {self.exercise_type})"

class ExerciseBlank(models.Model):
    """
    Для типа 'editing'.
    Хранит «пропуски»: позиция, правильный ответ, (возможно варианты).
    Пример: text_position=10, correct_answer='went'
    """
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE,
        related_name='blanks'
    )
    blank_key = models.CharField(max_length=50)  # некий id/ключ
    correct_answer = models.CharField(max_length=100)
    position = models.PositiveIntegerField(default=0)
    # Можно добавить поле "choices" (JSON), если хотите хранить варианты
    choices = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Blank for {self.exercise.title}: key={self.blank_key}"


class ExerciseAttempt(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exercise_attempts'
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    # Можно хранить более детальную информацию
    # answers = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Attempt of {self.user} on {self.exercise.title} (score={self.score})"
