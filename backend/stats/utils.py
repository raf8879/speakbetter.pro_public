from django.utils import timezone
import datetime

# def award_xp_and_achievements(user, xp_gain=10):
#     from .models import UserStats, Achievement, UserAchievement
#
#     stats, _ = UserStats.objects.get_or_create(user=user)
#
#     # 1) обновляем XP
#     stats.xp += xp_gain
#
#     # 2) повышаем уровень
#     while stats.xp >= stats.level * 100:
#         stats.level += 1
#
#     # 3) обновляем streak (если нужно)
#     today = timezone.now().date()
#     if stats.last_activity == today:
#         pass  # уже сегодня было
#     else:
#         if stats.last_activity == today - datetime.timedelta(days=1):
#             stats.streak += 1
#         else:
#             stats.streak = 1
#         stats.last_activity = today
#
#     stats.save()
#
#     # 4) проверяем, не дать ли ачивку
#     # напр., если набрал XP >= 100 => Achievement c key="xp100"
#     # if stats.xp >= 100:
#     #    try:
#     #        ach = Achievement.objects.get(key="xp100")
#     #        # есть ли уже у user
#     #        if not UserAchievement.objects.filter(user=user, achievement=ach).exists():
#     #            UserAchievement.objects.create(user=user, achievement=ach)
#     #            # +reward xp
#     #            stats.xp += ach.xp_reward
#     #            stats.save()
#     #    except Achievement.DoesNotExist:
#     #        pass


# stats/stats_utils.py
# from django.utils import timezone
# import datetime
# from .models import UserStats, Achievement, UserAchievement
#
# def award_xp_and_achievements(user, xp_gain=10):
#     """
#     Добавляем пользователю XP, повышаем уровень, проверяем streak.
#     Вызываем логику выдачи ачивок по желанию.
#     Возвращаем: (xp_gain, list_of_unlocked_achievements)
#     """
#     if not user.is_authenticated:
#         return (0, [])
#
#     stats, _ = UserStats.objects.get_or_create(user=user)
#
#     # 1) добавляем XP
#     stats.xp += xp_gain
#
#     # 2) повышаем уровень (простой способ: нужно 100*level XP для следующего)
#     while stats.xp >= stats.level * 100:
#         stats.level += 1
#
#     # 3) обновляем streak (по желанию)
#     today = timezone.now().date()
#     if stats.last_activity == today:
#         # уже сегодня было
#         pass
#     else:
#         if stats.last_activity == today - datetime.timedelta(days=1):
#             stats.streak += 1
#         else:
#             stats.streak = 1
#         stats.last_activity = today
#
#     stats.save()
#
#     # 4) проверяем, не выдавать ли ачивки
#     unlocked = ["XP500", "Perfect Speaker"]
#
#     # -- пример: если xp >= 500 => Achievement "xp500"
#     # try:
#     #     if stats.xp >= 500:
#     #         ach = Achievement.objects.get(key="xp500")
#     #         if not UserAchievement.objects.filter(user=user, achievement=ach).exists():
#     #             # даём
#     #             UserAchievement.objects.create(user=user, achievement=ach)
#     #             # +reward
#     #             stats.xp += ach.xp_reward
#     #             stats.save()
#     #             unlocked.append(ach.title)
#     # except Achievement.DoesNotExist:
#     #     pass
#
#     return (xp_gain, unlocked)


# gamification/utils.py
# gamification/utils.py
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

