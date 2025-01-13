# from django.db import models
# from django.conf import settings  # Нужно импортировать settings
#
#
# class ChatContext(models.Model):
#     # Вместо User используем settings.AUTH_USER_MODEL
#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )
#     messages = models.JSONField(default=list)
#
#     def __str__(self):
#         return f"ChatContext of {self.user.username}"
from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    """
    У каждого user может быть до 3 комнат (по темам):
    topic = 'past'/'present'/'future'
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_rooms'
    )
    topic = models.CharField(max_length=20)  # 'past', 'present', 'future'
    messages = models.JSONField(default=list)  # [{role, content}, ...]

    # Дополнительно: timestamps, count и т.п. при желании
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'topic')

    def __str__(self):
        return f"ChatRoom(user={self.user.username}, topic={self.topic})"
