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
