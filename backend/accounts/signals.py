
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from subscriptions.models import Plan, UserSubscription

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def assign_free_plan(sender, instance, created, **kwargs):
    if created:

        free_plan, _ = Plan.objects.get_or_create(
            name="free",
            defaults={"description":"Free plan", "max_requests_per_day":999999}
        )
        UserSubscription.objects.create(user=instance, plan=free_plan)
