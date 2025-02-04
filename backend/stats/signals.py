from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProgress

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_progress(sender, instance, created, **kwargs):
    if created:
        UserProgress.objects.create(user=instance)
