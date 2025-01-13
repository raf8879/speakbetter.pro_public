# # exercises/views_submit.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.db import transaction
# from .models import Exercise, ExerciseBlank, ExerciseAttempt
#
#
# class SubmitAnswersView(APIView):
#     """
#     POST /api/exercises/<int:exercise_id>/submit/
#     body: {"answers":{"blank_key_1":"went","blank_key_2":"did"}}
#     """
#
#     def post(self, request, exercise_id):
#         # 1) Найти exercise
#         try:
#             exercise = Exercise.objects.get(pk=exercise_id)
#         except Exercise.DoesNotExist:
#             return Response({"error": "Exercise not found"}, status=404)
#
#         # Проверка: если exercise_type != 'editing', можно вообще вернуть 400
#         if exercise.exercise_type != 'editing':
#             return Response({"error": "This exercise is not 'editing' type"}, status=400)
#
#         # 2) Берём answers
#         answers = request.data.get('answers', {})
#         if not isinstance(answers, dict):
#             return Response({"error": "No answers dict provided"}, status=400)
#
#         # 3) Собираем blanks
#         blanks = exercise.blanks.all()
#         total_blanks = blanks.count()
#         if total_blanks == 0:
#             return Response({"error": "No blanks in this exercise"}, status=400)
#
#         correct_count = 0
#         # Для отладки сохраним детальную инфу
#         detail_info = []
#
#         for b in blanks:
#             user_answer = answers.get(b.blank_key, "").strip().lower()
#             correct_answer = b.correct_answer.strip().lower()
#             is_correct = (user_answer == correct_answer)
#             if is_correct:
#                 correct_count += 1
#
#             detail_info.append({
#                 "blank_key": b.blank_key,
#                 "correct_answer": b.correct_answer,
#                 "user_answer": user_answer,
#                 "is_correct": is_correct
#             })
#
#         score_percent = round((correct_count / total_blanks) * 100, 2)
#
#         # Если user.is_authenticated -> создаём ExerciseAttempt
#         user = request.user
#         attempt_obj = None
#         if user.is_authenticated:
#             with transaction.atomic():
#                 attempt_obj = ExerciseAttempt.objects.create(
#                     user=user,
#                     exercise=exercise,
#                     score=score_percent
#                 )
#                 # можно записать detail_info в JSONField, если хотите
#                 # attempt_obj.details = detail_info
#                 # attempt_obj.save()
#
#         return Response({
#             "score": score_percent,
#             "correct_count": correct_count,
#             "total_blanks": total_blanks,
#             "detail": detail_info,
#             # attempt_id? ...
#             "attempt_id": attempt_obj.id if attempt_obj else None
#         }, status=200)

# exercises/views_submit.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Exercise, ExerciseAttempt, ExerciseBlank
from stats.utils import award_xp
from stats.models import EventLog
class SubmitAnswersView(APIView):
    """
    POST /api/exercises/<int:exercise_id>/submit/
    Body: { "answers": { "gap1":"went", "gap2":"do"... } }

    Логика:
      1) Проверяем, что exercise_id существует.
      2) Если exercise_type != 'editing', можно вернуть ошибку / или игнорировать.
      3) Считаем, сколько ответов совпали с correct_answer -> получаем score (в процентах).
      4) Если user.is_authenticated, записываем ExerciseAttempt.
      5) Возвращаем JSON со score, + детальным сравнением (что верно, что нет).
    """

    def post(self, request, exercise_id=None):
        # 1) Ищем Exercise
        try:
            exercise = Exercise.objects.get(pk=exercise_id)
        except Exercise.DoesNotExist:
            return Response({"error":"Exercise not found"}, status=404)

        if exercise.exercise_type != 'editing':
            return Response({"error":"This exercise is not 'editing' type."}, status=400)

        answers_data = request.data.get('answers', {})
        if not isinstance(answers_data, dict):
            return Response({"error":"Invalid 'answers' format"}, status=400)

        # 2) Собираем все blanks
        blanks = exercise.blanks.all()  # QuerySet of ExerciseBlank
        total_blanks = blanks.count()
        if total_blanks == 0:
            return Response({"error":"No blanks in this exercise"}, status=400)

        correct_count = 0
        details = []
        for blank in blanks:
            user_answer = answers_data.get(blank.blank_key, "").strip().lower()
            correct_ans = blank.correct_answer.strip().lower()
            is_correct = (user_answer == correct_ans)
            if is_correct:
                correct_count += 1
            details.append({
                "blank_key": blank.blank_key,
                "user_answer": user_answer,
                "correct_answer": blank.correct_answer,
                "is_correct": is_correct
            })

        score_percent = (correct_count / total_blanks) * 100

        # 3) Записываем в БД Attempt, если авторизован
        user = request.user
        xp_data = None
        if user.is_authenticated:
            EventLog.objects.create(
                user=request.user,
                event_type="enter_exercises"
            )
            with transaction.atomic():
                attempt = ExerciseAttempt.objects.create(
                    user=user,
                    exercise=exercise,
                    score=score_percent
                )
                # Если хотите хранить подробности, используйте JSONField (например, answers)
                # attempt.answers = details
                # attempt.save()
                if score_percent >= 80:
                    xp_data = award_xp(user, 10)# например 10 XP

        resp = {
            "score": round(score_percent, 2),
            "details": details}
        if xp_data:
            resp["xp_gained"] = xp_data["xp_gained"]
            resp["achievements_unlocked"] = xp_data["achievements_unlocked"]
            resp["new_xp"] = xp_data["new_xp"]

        # 4) Возвращаем
        return Response(
            resp,
            # "score": round(score_percent, 2),
            # "details": details
         status=200)
