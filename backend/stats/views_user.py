# # stats/views_user.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from django.db.models import Avg, Count
#
# from pronunciation.models import PronunciationAttempt
# from exercises.models import ExerciseAttempt
# # ... при необходимости другие модели ...
#
# class UserStatsView(APIView):
#     """
#     GET /api/stats/user/
#     Возвращает статистику для конкретного пользователя (прогресс).
#     Можно собирать всё, что нужно.
#     """
#     def get(self, request):
#         user = request.user
#         if not user.is_authenticated:
#             return Response({"error": "Not authenticated"}, status=401)
#
#         # 1) Pronunciation
#         pron_qs = PronunciationAttempt.objects.filter(user=user)
#         avg_score = pron_qs.aggregate(Avg('score'))["score__avg"] or 0
#         total_pron_ex = pron_qs.values('exercise').distinct().count()
#
#         # 2) Exercises (reading/editing)
#         ex_qs = ExerciseAttempt.objects.filter(user=user)
#         total_ex = ex_qs.values('exercise').distinct().count()
#         avg_ex_score = ex_qs.aggregate(Avg('score'))["score__avg"] or 0
#
#         data = {
#           "pronunciation": {
#             "avg_score": round(avg_score, 2),
#             "exercises_read": total_pron_ex
#           },
#           "exercises": {
#             "total_ex": total_ex,
#             "avg_score": round(avg_ex_score, 2),
#           }
#         }
#         return Response(data)
