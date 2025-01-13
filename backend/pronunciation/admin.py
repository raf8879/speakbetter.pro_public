# pronunciation/admin.py
from django.contrib import admin
from .models import PronunciationExercise, PronunciationAttempt, MispronouncedWord

# @admin.register(PronunciationExercise)
# class PronunciationExerciseAdmin(admin.ModelAdmin):
#     list_display = ("title", "level", "created_at")
#     search_fields = ("title", "level")
#     # Можно добавить фильтры, поля для редактирования и т.д.
#
# @admin.register(PronunciationAttempt)
# class PronunciationAttemptAdmin(admin.ModelAdmin):
#     list_display = ("user", "exercise", "score", "created_at")
#     list_filter = ("exercise", "user")
#
# @admin.register(MispronouncedWord)
# class MispronouncedWordAdmin(admin.ModelAdmin):
#     list_display = ("attempt", "word", "accuracy")
#     list_filter = ("attempt__exercise", "attempt__user")


from django.contrib import admin
from .models import PronunciationExercise, PronunciationAttempt, MispronouncedWord

@admin.register(PronunciationExercise)
class PronunciationExerciseAdmin(admin.ModelAdmin):
    list_display = ("title", "level", "created_at")
    search_fields = ("title", "level")
    list_filter = ("level",)

@admin.register(PronunciationAttempt)
class PronunciationAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "exercise", "score", "created_at")
    list_filter = ("exercise", "user")

@admin.register(MispronouncedWord)
class MispronouncedWordAdmin(admin.ModelAdmin):
    list_display = ("attempt", "word", "accuracy")
    list_filter = ("attempt__exercise", "attempt__user")



from django.contrib import admin
from .models import MispronouncedWordGlobal

@admin.register(MispronouncedWordGlobal)
class MWGAdmin(admin.ModelAdmin):
    list_display = ("user", "word", "accuracy", "created_at")
    search_fields = ("word", "user__username")
    list_filter = ("user",)





