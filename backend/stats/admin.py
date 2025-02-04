from django.contrib import admin
from .models import UserProgress, Achievement, UnlockedAchievement

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'xp']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'xp_threshold']

@admin.register(UnlockedAchievement)
class UnlockedAchievementAdmin(admin.ModelAdmin):
    list_display = ['user_progress', 'achievement', 'unlocked_at']
    list_filter = ['achievement__code']



from .models import EventLog

@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ("user", "event_type", "timestamp")
    list_filter = ("event_type", "timestamp", "user")
    search_fields = ("user__username", "event_type")
