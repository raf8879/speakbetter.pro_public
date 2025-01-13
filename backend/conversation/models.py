from django.db import models
from django.conf import settings
from django.utils import timezone

# class VoiceConversation(models.Model):
#     """
#     Каждая «сессия» голосового общения у авторизованного пользователя.
#     """
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='voice_conversations')
#     created_at = models.DateTimeField(auto_now_add=True)
#     total_messages = models.IntegerField(default=0)
#
#     def __str__(self):
#         return f"VoiceConversation({self.id}) for {self.user.username}"

# class VoiceConversation(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='voice_conversations'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     total_messages = models.IntegerField(default=0)
#
#     topic = models.CharField(max_length=50, blank=True)  # "business", "travel", etc.
#
#     def __str__(self):
#         return f"Conversation({self.id}) by {self.user.username} (topic={self.topic})"
#
# class VoiceMessage(models.Model):
#     """
#     Каждое сообщение в рамках VoiceConversation (role: user/assistant).
#     """
#     conversation = models.ForeignKey(VoiceConversation, on_delete=models.CASCADE, related_name='messages')
#     role = models.CharField(max_length=20)  # "user" or "assistant" (или "system" если надо)
#     text = models.TextField()
#     is_feedback = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.role} msg: {self.text[:30]}"


# conversation/models.py
# from django.db import models
# from django.conf import settings
#
# class VoiceConversation(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='voice_conversations'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     total_messages = models.IntegerField(default=0)
#     topic = models.CharField(max_length=50, blank=True)  # "business", "travel", ...
#
#     def __str__(self):
#         return f"Conversation({self.id}) by {self.user.username} (topic={self.topic})"
#
#
# class VoiceMessage(models.Model):
#     conversation = models.ForeignKey(
#         VoiceConversation, on_delete=models.CASCADE, related_name='messages'
#     )
#     role = models.CharField(max_length=20)  # "system"/"user"/"assistant"
#     text = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.role} msg: {self.text[:30]}"


# conversation/models.py
from django.db import models
from django.conf import settings

class VoiceConversation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='voice_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    total_messages = models.IntegerField(default=0)
    topic = models.CharField(max_length=50)  # "business", "travel", "doctor", "interview"

    class Meta:
        unique_together = ('user', 'topic')

    def __str__(self):
        return f"Conversation({self.id}) by {self.user.username} topic={self.topic}"


class VoiceMessage(models.Model):
    conversation = models.ForeignKey(
        VoiceConversation, on_delete=models.CASCADE, related_name='messages'
    )
    role = models.CharField(max_length=20)  # "system"/"user"/"assistant"
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} msg: {self.text[:30]}"
