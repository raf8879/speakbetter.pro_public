from django.contrib import admin
from .models import Exercise, ExerciseBlank, ExerciseAttempt


@admin.register(ExerciseBlank)
class ExerciseBlankAdmin(admin.ModelAdmin):
    list_display = ["exercise", "blank_key", "correct_answer", "position"]
    search_fields = ["blank_key", "correct_answer", "exercise__title"]
    list_filter = ["exercise__level", "exercise__exercise_type"]

@admin.register(ExerciseAttempt)
class ExerciseAttemptAdmin(admin.ModelAdmin):
    list_display = ["user", "exercise", "score", "created_at"]
    search_fields = ["user__username", "exercise__title"]
    list_filter = ["exercise__level", "exercise__exercise_type"]

class BlankItemInline(admin.TabularInline):
    model = ExerciseBlank
    extra = 1  # сколько «пустых» строк для новых blank'ов изначально

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ["title", "exercise_type", "level", "creator", "created_at"]
    list_filter = ["exercise_type", "level"]
    inlines = [BlankItemInline]