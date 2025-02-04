from django.db import transaction
from .models import UserProgress, Achievement, UnlockedAchievement
from django.utils import timezone

@transaction.atomic
def award_xp(user, amount):
    """
    Начисляет пользователю `amount` XP. Возвращает dict:
      {
        "xp_gained": amount,
        "new_xp": new_xp_value,
        "achievements_unlocked": [
            {"code":"xp100","name":"Some Achiev","description":..., "unlocked_at":...},
            ...
        ]
      }
    """
    if not user or not user.is_authenticated:
        return {
            "xp_gained": 0,
            "new_xp": 0,
            "achievements_unlocked": []
        }

    # 1) Достаём / создаём UserProgress
    progress = getattr(user, 'progress', None)
    if not progress:
        progress = UserProgress.objects.create(user=user, xp=0)

    old_xp = progress.xp
    new_xp = old_xp + amount
    progress.xp = new_xp
    progress.save()

    # 2) Проверяем достижения, которые:
    #   - Имеют xp_threshold <= new_xp
    #   - Ещё не разблокированы
    newly_unlocked = []
    achievements_to_unlock = Achievement.objects.filter(
        xp_threshold__gt=old_xp,  # ещё не было доступно
        xp_threshold__lte=new_xp   # сейчас уже доступно
    ).order_by('xp_threshold')  # можно по threshold

    for ach in achievements_to_unlock:
        # проверяем нет ли записи в UnlockedAchievement
        if not UnlockedAchievement.objects.filter(
            user_progress=progress,
            achievement=ach
        ).exists():
            ua = UnlockedAchievement.objects.create(
                user_progress=progress,
                achievement=ach,
                unlocked_at=timezone.now()
            )
            newly_unlocked.append(ua)

    # Сформируем удобный формат для вывода
    unlocked_list = []
    for ua in newly_unlocked:
        a = ua.achievement
        unlocked_list.append({
            "code": a.code,
            "name": a.name,
            "description": a.description,
            "unlocked_at": ua.unlocked_at.isoformat()
        })

    return {
        "xp_gained": amount,
        "new_xp": new_xp,
        "achievements_unlocked": unlocked_list
    }

