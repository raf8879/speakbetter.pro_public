from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import EventLog

User = get_user_model()

class AdminStatsView(APIView):
    """
    GET /api/stats/admin/
    Пример статистики:
      - total_users
      - active_users_daily / weekly (по last_login)
      - кол-во "enter_..." за неделю
      - most_popular_mode
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1) Кол-во пользователей
        total_users = User.objects.count()

        # 2) Активные (last_login) за сутки / неделю
        now = timezone.now()
        day_ago = now - timedelta(days=1)
        week_ago = now - timedelta(days=7)

        # active_users_daily = User.objects.filter(last_login__gte=day_ago).count()
        active_users_daily = EventLog.objects.filter(timestamp__gte=day_ago).values('user').distinct().count()
        # active_users_weekly = User.objects.filter(last_login__gte=week_ago).count()
        active_users_weekly = EventLog.objects.filter(timestamp__gte=week_ago).values('user').distinct().count()

        # 3) Подсчёт events за неделю
        # Если вы пишете в event_type = "enter_chat", "enter_pronunciation", ...
        # то хотим сгруппировать
        events_week = EventLog.objects.filter(timestamp__gte=week_ago)
        # group by event_type
        counts = (
            events_week.values('event_type')
            .annotate(total=Count('id'))
        )
        # соберём в dict
        mode_counts = {}
        for item in counts:
            etype = item['event_type']  # "enter_pronunciation" ...
            total = item['total']

            # Возможно, убираем префикс "enter_"
            if etype.startswith("enter_"):
                mode = etype[6:]
            else:
                mode = etype

            mode_counts[mode] = total

        # 4) Находим most_popular_mode
        most_popular_mode = None
        if mode_counts:
            most_popular_mode = max(mode_counts, key=mode_counts.get)

        data = {
            "total_users": total_users,
            "active_users_daily": active_users_daily,
            "active_users_weekly": active_users_weekly,
            "mode_counts": mode_counts,
            "most_popular_mode": most_popular_mode,
        }
        print(data)
        return Response(data)
