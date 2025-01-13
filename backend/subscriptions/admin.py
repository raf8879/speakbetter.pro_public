# subscriptions/admin.py
from django.contrib import admin
from .models import Plan, UserSubscription

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_requests_per_day', 'allow_gpt4')

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan')
