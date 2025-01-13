from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Exercise
from .serializers import ExerciseSerializer
from accounts.permissions import IsTeacher


class ExerciseViewSet(ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get("level", None)
        if level:
            qs = qs.filter(level=level)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        # Для просмотра:
        # Позволим гостям тоже смотреть упражнения (AllowAny)
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]

        return [IsAuthenticated()]



# exercises/views_stats.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Exercise, ExerciseAttempt
# from stats.models import EventLog
class ExerciseStatsView(APIView):
    """
    GET /api/exercises/stats/
    - Смотрит все ExerciseAttempt
    - Группирует по level (Beginner/Intermediate/Advanced)
    - Считает count, avg(score)
    """
    def get(self, request):
        # Если хотим статистику ТОЛЬКО для текущего user:
        user = request.user if request.user.is_authenticated else None

        # Берём все attempts (или filter(user=user) если статистика персональная)
        qs = ExerciseAttempt.objects.all()
        # Если хотите персональную:
        qs = qs.filter(user=user)

        # Для группировки по level,
        # нам нужно join к Exercise и group by exercise__level
        # В Django:
        #   1) соберём все levels
        #   2) для каждого level - считаем count, avg

        # Или используем Python-цикл
        data = {}
        levels = ["Beginner", "Intermediate", "Advanced"]
        for lvl in levels:
            # filter attempts по exercise__level=lvl
            lvl_qs = qs.filter(exercise__level=lvl)
            count_ = lvl_qs.count()
            avg_ = lvl_qs.aggregate(Avg('score'))['score__avg']
            data[lvl] = {
                "count": count_,
                "avg_score": round(avg_ or 0, 2),
            }

        return Response(data)
