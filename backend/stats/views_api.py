# # stats/views_api.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import UserStats, UserAchievement
# from .serializers import UserStatsSerializer, UserAchievementSerializer
#
# class MyStatsView(APIView):
#     """
#     GET /api/stats/my/
#     Возвращает:
#     {
#       "xp": 230,
#       "level": 3,
#       "streak": 5,
#       "achievements": [
#          {
#            "achievement": { "key":"xp500", "title":"XP 500", ...},
#            "earned_at":"2024-01-01T12:34:56Z"
#          },
#          ...
#       ]
#     }
#     """
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         user = request.user
#         # stats
#         try:
#             stats = user.stats
#         except UserStats.DoesNotExist:
#             return Response({"xp":0, "level":1, "streak":0, "achievements":[]})
#
#         stats_data = UserStatsSerializer(stats).data
#
#         # ачивки
#         user_achievs = UserAchievement.objects.filter(user=user).select_related('achievement')
#         achiev_data = UserAchievementSerializer(user_achievs, many=True).data
#
#         # объединяем:
#         data = {
#             **stats_data,
#             "achievements": achiev_data
#         }
#         return Response(data, status=200)
# gamification/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProgress, UnlockedAchievement

class GamificationStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            progress = user.progress  # OneToOne
        except UserProgress.DoesNotExist:
            return Response({"xp":0, "achievements":[]})

        xp_value = progress.xp

        unlocked_qs = UnlockedAchievement.objects.filter(user_progress=progress).select_related('achievement')
        achievements_list = []
        for ua in unlocked_qs:
            achievements_list.append({
                "code": ua.achievement.code,
                "name": ua.achievement.name,
                "description": ua.achievement.description,
                "unlocked_at": ua.unlocked_at.isoformat()
            })

        data = {
            "xp": xp_value,
            "achievements": achievements_list
        }
        return Response(data, status=200)
