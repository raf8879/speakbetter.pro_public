from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg
from .models import PronunciationAttempt

#xz
# class PronunciationStatsView(APIView):
#     def get(self, request):
#         user = request.user
#         if not user.is_authenticated:
#             return Response({"error": "Not authenticated"}, status=401)
#
#         avg_score = PronunciationAttempt.objects.filter(user=user).aggregate(Avg('score'))["score__avg"]
#         total_exercises = (PronunciationAttempt.objects
#                            .filter(user=user)
#                            .values('exercise')
#                            .distinct()
#                            .count())
#
#         return Response({
#             "avg_score": round(avg_score or 0, 2),
#             "exercises_read": total_exercises
#         })
