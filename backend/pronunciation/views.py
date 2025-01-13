# from django.shortcuts import render
#
# # pronunciation/views.py
#
# import os
# import tempfile
# import shutil
# from django.db import transaction
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
#
# from .mfa_utils import run_mfa_alignment
# from .models import PronunciationExercise, PronunciationAttempt, MispronouncedWord
# from .utils import compute_score_from_alignment  # (сделаем ниже)
from conversation.coqui_tts import synthesize_speech_b64  # если нужно
# from rest_framework import status
from rest_framework.generics import GenericAPIView
# from django.http import JsonResponse
# from conversation.whisper_utils import transcribe_file
# from subscriptions.models import UserSubscription
# from subscriptions.utils import check_and_increment_requests
# from django.core.cache import cache
# from django.conf import settings
#
# def get_model_for_user(user):
#     """ Пример: Возвращаем модель GPT
#         (Если вдруг нужно GPT, как в ConversationView) """
#     if not user.is_authenticated:
#         return "gpt-3.5-turbo"
#
#     try:
#         sub = user.usersubscription
#     except UserSubscription.DoesNotExist:
#         return "gpt-3.5-turbo"
#
#     plan = sub.plan
#     if plan.allow_gpt4:
#         return "gpt-4"
#     return "gpt-3.5-turbo"
#
class ListenWordView(GenericAPIView):
    """
    GET /api/pronunciation/word-audio/?word=CAT
    Возвращает { "audio_b64": ... }
    """

    def get(self, request):
        word = request.GET.get("word", "")
        if not word:
            return JsonResponse({"error": "No word"}, status=400)

        # Вызываем Coqui TTS
        audio_b64 = synthesize_speech_b64(word)
        return JsonResponse({"audio_b64": audio_b64})
#
#
# class PronunciationAttemptView(APIView):
#     """
#     POST /api/pronunciation/<exercise_id>/attempt/
#
#     ПОВЕДЕНИЕ:
#       1) Проверяем лимиты (гость / авторизован).
#       2) Если аудио пришло, запускаем MFA (или Whisper).
#       3) Если user is_authenticated:
#          - Пишем в БД PronunciationAttempt.
#       4) Иначе (гость):
#          - Сохраняем в Redis или просто не сохраняем, но считаем лимиты.
#       5) Возвращаем JSON со score и проч., как раньше.
#     """
#
#     def post(self, request, exercise_id):
#         user = request.user
#         if not check_and_increment_requests(user):
#             return Response(
#                 {"error": "Request limit reached. Please upgrade or wait."},
#                 status=403
#             )
#
#         # (2) Проверяем, есть ли аудио
#         audio_file = request.FILES.get('audio')
#         if not audio_file:
#             return Response({"error": "No audio file provided"}, status=400)
#
#         # Проверка размера
#         if audio_file.size > 10 * 1024 * 1024:
#             return Response({"error": "Audio file too large (>10MB)"}, status=400)
#
#         # (3) Пытаемся найти exercise
#         try:
#             exercise = PronunciationExercise.objects.get(pk=exercise_id)
#         except PronunciationExercise.DoesNotExist:
#             return Response({"error": "Exercise not found"}, status=404)
#
#         # (4) Сохраняем аудио во временный файл
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             for chunk in audio_file.chunks():
#                 tmp.write(chunk)
#             tmp_path = tmp.name
#
#         # (5) Запускаем MFA или Whisper + alignment
#         try:
#             alignment_result = run_mfa_alignment(tmp_path, exercise.text)
#         except Exception as e:
#             os.remove(tmp_path)
#             return Response({"error": f"MFA error: {str(e)}"}, status=500)
#         finally:
#             if os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#
#         # (6) Считаем score
#         score, words_detail = compute_score_from_alignment(alignment_result)
#
#         # (7) Сохраняем результат
#         #     Авторизованному - в БД (PronunciationAttempt)
#         #     Гостю - в Redis
#         if user.is_authenticated:
#             # можно, как в ConversationView, удалять старые attempts?
#             # PronunciationAttempt.objects.filter(user=user, exercise=exercise).delete()
#
#             with transaction.atomic():
#                 attempt = PronunciationAttempt.objects.create(
#                     user=user,
#                     exercise=exercise,
#                     score=score,
#                     recognized_text=f"MFA alignment. {len(alignment_result)} words found."
#                 )
#                 # Сохраняем mispronounced
#                 for w_info in words_detail:
#                     # print(">>> MFA STDOUT:", e.stdout, flush=True)
#                     print(w_info["status"], flush=True)
#                     if w_info["status"] in ("mispronounced", "poor"):
#                         MispronouncedWord.objects.create(
#                             attempt=attempt,
#                             word=w_info["word"],
#                             accuracy=w_info.get("accuracy", 0.0),
#                             start_time=w_info["start_time"],
#                             end_time=w_info["end_time"]
#                         )
#         else:
#             # Гость => Redis
#             # Можно хранить attempts в redis, напр.:
#             guest_id = request.COOKIES.get('guest_id', 'anon')
#             redis_key = f"pronun_guest:{guest_id}"
#             data = {
#                 "exercise_id": exercise_id,
#                 "score": score,
#                 "words": words_detail,
#                 "time": timezone.now().isoformat()
#             }
#             # Сохраняем массив attempts
#             attempts = cache.get(redis_key, [])
#             attempts.append(data)
#             cache.set(redis_key, attempts, timeout=24 * 3600)
#
#         # (8) Формируем ответ
#         response_data = {
#             "score": score,
#             "words": words_detail
#         }
#         return Response(response_data, status=200)

from rest_framework.response import Response


# pronunciation/views.py
import os
import tempfile
import shutil

from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import PronunciationExercise, PronunciationAttempt, MispronouncedWord
from .whisper_utils import transcribe_with_words
# from .distance_utils import phoneme_distance_score
# from .g2p_utils import word_to_phonemes  # если хотим покадрово
from subscriptions.utils import check_and_increment_requests
from django.core.cache import cache

# class PronunciationAttemptView(APIView):
#     """
#     POST /api/pronunciation/<exercise_id>/attempt/
#     form-data: audio=@file.wav
#
#     Логика:
#     1) Лимиты
#     2) Сохраняем .wav
#     3) Whisper -> recognized_text + word timestamps
#     4) Считаем score (г2p + Levenshtein)
#     5) При желании создаём MispronouncedWord
#     6) Сохраняем в БД (если user.is_authenticated)
#     7) Возвращаем JSON: {score, recognized_text, words:[{word, start,end}]}
#     """
#
#     def post(self, request, exercise_id):
#         user = request.user
#
#         # 1) Лимиты
#         if not check_and_increment_requests(user):
#             return Response({"error": "Limit reached. Upgrade?"}, status=403)
#
#         # 2) Аудио
#         audio_file = request.FILES.get('audio')
#         if not audio_file:
#             return Response({"error": "No audio file provided"}, status=400)
#         if audio_file.size > 10*1024*1024:
#             return Response({"error": "Audio file too large"}, status=400)
#
#         # 3) Ищем exercise
#         from .models import PronunciationExercise
#         try:
#             exercise = PronunciationExercise.objects.get(pk=exercise_id)
#         except PronunciationExercise.DoesNotExist:
#             return Response({"error":"Exercise not found"}, status=404)
#
#         # Сохраним во временный
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             for chunk in audio_file.chunks():
#                 tmp.write(chunk)
#             tmp_path = tmp.name
#
#         # 4) Whisper
#         try:
#             whisper_res = transcribe_with_words(tmp_path)
#             recognized_text = whisper_res["text"].strip()
#             whisper_words = whisper_res["words"]  # [{"word":"Hello","start":0.5,"end":1.0},...]
#         except Exception as e:
#             os.remove(tmp_path)
#             return Response({"error": f"Whisper error: {str(e)}"}, status=500)
#         finally:
#             if os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#
#         # 5) Считаем score (g2p + Levenshtein)
#         ref_text = exercise.text
#         ratio = phoneme_distance_score(ref_text, recognized_text)
#         score = round(ratio*100, 2)
#
#         # [опционально] выясняем "mispronounced words"
#         #  - например, сопоставим ref_words[i] vs hyp_words[i],
#         #  - or do a more advanced approach
#         #  Для MVP упустим, или сделаем упрощённо.
#
#         # 6) Сохраняем в БД, если user.is_authenticated
#         attempt_obj = None
#         if user.is_authenticated:
#             with transaction.atomic():
#                 attempt_obj = PronunciationAttempt.objects.create(
#                     user=user,
#                     exercise=exercise,
#                     score=score,
#                     recognized_text=recognized_text
#                 )
#                 # mispronounced (упростим)
#                 # mispronounced_words = ...
#                 # for (ref,acc <0.8)...
#
#         else:
#             # Гость → Redis, e.g.
#             guest_id = request.COOKIES.get('guest_id','anon')
#             redis_key = f"pronun_guest:{guest_id}"
#             data = {
#                 "exercise_id": exercise_id,
#                 "score": score,
#                 "recognized_text": recognized_text,
#                 "time": timezone.now().isoformat()
#             }
#             attempts = cache.get(redis_key, [])
#             attempts.append(data)
#             cache.set(redis_key, attempts, timeout=24*3600)
#
#         # Финальный JSON
#         return Response({
#             "score": score,
#             "recognized_text": recognized_text,
#             "words": whisper_words  # [{"word":"Hello","start":0.5,"end":1.0},...]
#         }, status=200)




################################### work_verion
#
from rest_framework.views import APIView
# LEVELS_AVAILABLE = ["A1","A2","B1","B2","C1","C2","C3"]
LEVELS_AVAILABLE = ['Beginner', 'Intermediate', 'Advanced']
class PronunciationLevelsView(APIView):
    def get(self, request):
        # Просто возвращаем массив уровней
        return Response(LEVELS_AVAILABLE)
# #
# #
# #
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PronunciationExercise
# Если используете Serializer:
# from .serializers import PronunciationExerciseSerializer

class ExerciseListView(APIView):
    """
    GET /api/pronunciation/exercises/?level=B1
    Возвращает список упражнений
    """

    def get(self, request):
        level = request.GET.get('level', None)  # "B1" or None
        qs = PronunciationExercise.objects.all().order_by('created_at')
        if level:
            qs = qs.filter(level=level)

        data = []
        for ex in qs:
            data.append({
                "id": ex.id,
                "title": ex.title,
                "level": ex.level,
                "text": ex.text,
                "created_at": ex.created_at.isoformat()
            })

        return Response(data)
# #
# #
# #
class ExerciseDetailView(APIView):
    """
    GET /api/pronunciation/exercises/<id>/
    """
    def get(self, request, pk):
        from .models import PronunciationExercise
        try:
            ex = PronunciationExercise.objects.get(pk=pk)
        except PronunciationExercise.DoesNotExist:
            return Response({"error":"Not found"}, status=404)

        data = {
            "id": ex.id,
            "title": ex.title,
            "level": ex.level,
            "text": ex.text,
            "created_at": ex.created_at.isoformat()
        }
        return Response(data)
#
#
#
# import os
# import tempfile
# import shutil
# from django.db import transaction
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
#
# from .models import PronunciationExercise, PronunciationAttempt, MispronouncedWord
# from .whisper_utils import transcribe_with_words
# from .distance_utils import phoneme_distance_score
# from subscriptions.utils import check_and_increment_requests
# from django.core.cache import cache
#
# class PronunciationAttemptView(APIView):
#     """
#     POST /api/pronunciation/<exercise_id>/attempt/
#     multipart/form-data:
#       audio=@file.wav
#
#     Шаги:
#      1. Проверка лимитов (check_and_increment_requests).
#      2. Сохранение .wav во временный файл
#      3. Whisper -> recognized_text + words (start/end)
#      4. Считаем score = phoneme_distance_score(ref_text, recognized_text)*100
#      5. Сохраняем Attempt. При желании — MispronouncedWord.
#      6. Возвращаем JSON {score, recognized_text, words}
#     """
#
#     def post(self, request, exercise_id):
#         user = request.user
#
#         # 1) Лимиты
#         if not check_and_increment_requests(user):
#             return Response({"error":"Limit reached. Upgrade plan or wait."}, status=403)
#
#         # 2) Получаем audio
#         audio_file = request.FILES.get('audio')
#         if not audio_file:
#             return Response({"error":"No audio file provided"}, status=400)
#         if audio_file.size > 10 * 1024 * 1024:
#             return Response({"error":"Audio file too large (>10MB)"}, status=400)
#
#         # 3) Ищем exercise
#         try:
#             exercise = PronunciationExercise.objects.get(pk=exercise_id)
#         except PronunciationExercise.DoesNotExist:
#             return Response({"error":"Exercise not found"}, status=404)
#
#         # Сохраним аудио во временный файл
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             for chunk in audio_file.chunks():
#                 tmp.write(chunk)
#             tmp_path = tmp.name
#
#         # 4) Whisper
#         try:
#             whisper_res = transcribe_with_words(tmp_path)
#             recognized_text = whisper_res["text"].strip()
#             whisper_words = whisper_res["words"]  # [{word, start, end}, ...]
#         except Exception as e:
#             os.remove(tmp_path)
#             return Response({"error": f"Whisper error: {str(e)}"}, status=500)
#         finally:
#             if os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#
#         # 5) Считаем score
#         ref_text = exercise.text
#         ratio = phoneme_distance_score(ref_text, recognized_text)  # 0..1
#         score = round(ratio*100, 2)
#
#         attempt_obj = None
#         # Если user.is_authenticated — сохраним Attempt + MispronouncedWords
#         if user.is_authenticated:
#             with transaction.atomic():
#                 attempt_obj = PronunciationAttempt.objects.create(
#                     user=user,
#                     exercise=exercise,
#                     score=score,
#                     recognized_text=recognized_text
#                 )
#                 #При желании сопоставляем ref_words vs recognized_words
#                 #Упрощённо:
#                 for w_info in whisper_words:
#                     if (w_info["end"] - w_info["start"]) < 0.1:
#                         MispronouncedWord.objects.create(
#                             attempt=attempt_obj,
#                             word=w_info["word"],
#                             accuracy=0.0,
#                             start_time=w_info["start"],
#                             end_time=w_info["end"]
#                         )
#                     else:
#                         # "ok"
#                         MispronouncedWord.objects.create(
#                             attempt=attempt_obj,
#                             word=w_info["word"],
#                             accuracy=1.0,
#                             start_time=w_info["start"],
#                             end_time=w_info["end"]
#                         )
#         else:
#             # Если гость — сохраняем в Redis (или игнорируем)
#             guest_id = request.COOKIES.get('guest_id','anon')
#             redis_key = f"pronun_guest:{guest_id}"
#             data = {
#                 "exercise_id": exercise_id,
#                 "score": score,
#                 "recognized_text": recognized_text,
#                 "time": timezone.now().isoformat()
#             }
#             attempts = cache.get(redis_key, [])
#             if not attempts:
#                 attempts = []
#             attempts.append(data)
#             cache.set(redis_key, attempts, timeout=24*3600)
#
#         return Response({
#             "score": score,
#             "recognized_text": recognized_text,
#             "words": whisper_words
#         }, status=200)
#
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg
from .models import PronunciationAttempt
# #
class PronunciationStatsView(APIView):
    """
    GET /api/pronunciation/stats/
    Возвращает {"avg_score":..., "exercises_read":...}
    user должен быть авторизован
    """

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error":"Not authenticated"}, status=401)

        avg_score = PronunciationAttempt.objects.filter(user=user).aggregate(Avg('score'))["score__avg"] or 0.0
        total_exercises = (
            PronunciationAttempt.objects
            .filter(user=user)
            .values_list('exercise', flat=True)
            .distinct()
            .count()
        )
        data = {
            "avg_score": round(avg_score, 2),
            "exercises_read": total_exercises
        }
        return Response(data)
################################### work_verion

import os
import tempfile
import logging

from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
import logging
from .models import PronunciationExercise, PronunciationAttempt, MispronouncedWord
from .utils_azure import convert_to_wav, analyze_pronunciation_azure
from subscriptions.utils import check_and_increment_requests

#
# class PronunciationAttemptView(APIView):
#     def post(self, request, exercise_id):
#         user = request.user
#         if not check_and_increment_requests(user):
#             return Response({"error": "Request limit reached. Upgrade."}, status=403)
#
#         audio_file = request.FILES.get('audio')
#         if not audio_file:
#             return Response({"error": "No audio file provided"}, status=400)
#
#         if audio_file.size > 10 * 1024 * 1024:
#             return Response({"error": "Audio file too large"}, status=400)
#
#         try:
#             exercise = PronunciationExercise.objects.get(pk=exercise_id)
#         except PronunciationExercise.DoesNotExist:
#             return Response({"error": "Exercise not found"}, status=404)
#
#         # Сохраняем файл
#         media_dir = "/app/media"
#         os.makedirs(media_dir, exist_ok=True)
#         input_path = os.path.join(media_dir, f"{exercise_id}_input.webm")
#         with open(input_path, "wb") as f:
#             for chunk in audio_file.chunks():
#                 f.write(chunk)
#
#         converted_path = os.path.join(media_dir, f"{exercise_id}_converted.wav")
#         try:
#             # Конвертируем в WAV
#             convert_to_wav(input_path, converted_path)
#         except Exception as e:
#             if os.path.exists(input_path):
#                 os.remove(input_path)
#             return Response({"error": f"Audio conversion error: {str(e)}"}, status=500)
#         finally:
#             if os.path.exists(input_path):
#                 os.remove(input_path)
#
#         # Отправляем задачу в Celery
#         task = analyze_pronunciation_task.delay(
#             converted_path,
#             exercise.text,
#             exercise_id,
#             user.id if user.is_authenticated else None
#         )
#         return Response({"task_id": task.id, "message": "Анализ запущен. Проверьте статус позже."}, status=202)
#
#
# from celery.result import AsyncResult
#
# class PronunciationTaskStatusView(APIView):
#     def get(self, request, task_id):
#         task_result = AsyncResult(task_id)
#         if task_result.state == "PENDING":
#             return Response({"status": "В обработке"})
#         elif task_result.state == "SUCCESS":
#             result = task_result.result
#             return Response({"status": "Готово", "result": result})
#         elif task_result.state == "FAILURE":
#             return Response({"status": "Ошибка", "error": str(task_result.result)})
logger = logging.getLogger(__name__)
from stats.utils import award_xp
from stats.models import EventLog
from .models import MispronouncedWordGlobal
class PronunciationAttemptView(APIView):
    """
    POST /api/pronunciation/<exercise_id>/attempt/
      form-data: audio=@file.webm (или mp3, wav, etc.)
    Возвращает JSON: { "score":..., "recognized_text":..., "words":[...] }
    """

    def post(self, request, exercise_id):
        user = request.user
        EventLog.objects.create(
            user=request.user,
            event_type="enter_pronunciation"
        )
        # 1) Лимиты
        if not check_and_increment_requests(user):
            return Response({"error": "Request limit reached. Upgrade."}, status=403)

        # 2) Взять audio
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({"error": "No audio file provided"}, status=400)

        # Проверка размера
        if audio_file.size > 5 * 1024 * 1024:
            return Response({"error": "Audio file too large"}, status=400)
        # if audio_file.size < 1024 * 10:
        #     return Response({"error": "Audio too small or empty"})

        # 3) Найдём exercise
        try:
            exercise = PronunciationExercise.objects.get(pk=exercise_id)
        except PronunciationExercise.DoesNotExist:
            return Response({"error": "Exercise not found"}, status=404)

        # 4) Сохраняем webm/mp3 => temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
            for chunk in audio_file.chunks():
                tmp_in.write(chunk)
            input_path = tmp_in.name

        # 5) Готовим путь для конвертации
        converted_path = input_path + "_conv.wav"
        try:
            # Конвертируем
            convert_to_wav(input_path, converted_path)
            # Для отладки
            size_conv = os.path.getsize(converted_path)
            logger.info(f"Converted WAV size = {size_conv} bytes, path={converted_path}")

            # 6) Вызываем Azure
            analysis = analyze_pronunciation_azure(converted_path, exercise.text)
            import json
            logger.info("Azure analysis result = %s", json.dumps(analysis, indent=2))
            print("AZURE RESULT:", analysis)
        except Exception as e:
            logger.error(f"Azure exception: {e}", exc_info=True)
            # Удаляем temp, converted
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(converted_path):
                os.remove(converted_path)
            return Response({"error": f"Azure error: {str(e)}"}, status=500)
        finally:
            # Удаляем исходный webm
            if os.path.exists(input_path):
                os.remove(input_path)
            # Если хотите, можно тоже удалять converted_path
            if os.path.exists(converted_path):
                os.remove(converted_path)

        # analysis = { "score":..., "recognized_text":"...", "words":[{"word":...,"score":...,"error_type":...},...] }
        overall_score = analysis["score"]
        accuracy_score = analysis["accuracy_score"]
        fluency_score = analysis["fluency_score"]
        completeness_score = analysis["completeness_score"]
        recognized_text = analysis["recognized_text"]
        words_detail = analysis["words"]
        xp_data = None

        # 7) Сохраняем в БД
        if user.is_authenticated:
            with transaction.atomic():
                attempt = PronunciationAttempt.objects.create(
                    user=user,
                    exercise=exercise,
                    score=overall_score,
                    recognized_text=recognized_text
                )
                # === ВАЖНО: Тут, если score>=80 => даём XP
                # Допустим, если score≥80 => даём 10 XP

                if overall_score >= 80:
                    xp_data = award_xp(user, 10)


                # Можно записать их в response, чтобы на фронте показать всплывающие "Unlocked..."
                # mispronounced
                # Скажем, порог 60 => если <60 => неверное
                for w in words_detail:
                    if w["score"] < 60:
                        # Это слово - "плохое"
                        obj, created = MispronouncedWordGlobal.objects.get_or_create(
                            user=user,
                            word=w["word"],
                            defaults={"accuracy": w["score"]}
                        )
                        if not created:
                            # уже было => можно при желании обновить "accuracy"
                            # (например, берем min, если мы трактуем accuracy как "наихудший результат")
                            if w["score"] < obj.accuracy:
                                obj.accuracy = w["score"]
                                obj.save()
                    # MispronouncedWord.objects.create(
                    #     attempt=attempt,
                    #     word=w["word"],
                    #     accuracy=w["score"],
                    #     start_time=0.0,
                    #     end_time=0.0
                    # )
        else:
            # Гость => redis
            guest_id = request.COOKIES.get('guest_id', 'anon')
            redis_key = f"pronun_guest:{guest_id}"
            data = {
                "exercise_id": exercise_id,
                "score": overall_score,
                "recognized_text": recognized_text,
                "words": words_detail,
                "time": timezone.now().isoformat()
            }
            attempts = cache.get(redis_key, [])
            if not attempts:
                attempts = []
            attempts.append(data)
            cache.set(redis_key, attempts, 24*3600)

        resp_data = {
            "score": overall_score,
            "accuracy_score": accuracy_score,
            "fluency_score": fluency_score,
            "completeness_score": completeness_score,
            "recognized_text": recognized_text,
            "words": words_detail}
        if xp_data:
            resp_data["xp_gained"] = xp_data["xp_gained"]
            resp_data["achievements_unlocked"] = xp_data["achievements_unlocked"]
            resp_data["new_xp"] = xp_data["new_xp"]
        print(resp_data)
        # 8) Отправим JSON на фронт
        return Response(resp_data
            # "score": overall_score,
            # "accuracy_score": accuracy_score,
            # "fluency_score": fluency_score,
            # "completeness_score": completeness_score,
            # "recognized_text": recognized_text,
            # "words": words_detail,
            # "xp_gained": xp_gained,
            # "achievements_unlocked": unlocked_codes,
        , status=200)


class MispronouncedWordGlobalView(APIView):
    """
    GET /api/pronunciation/miswords/
    Возвращает JSON со списком слов (unique).
    """
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        now = timezone.now()
        MispronouncedWordGlobal.objects.filter(
            user=user,
            reached_threshold_at__isnull=False,
            reached_threshold_at__lt=now
        ).delete()
        mis_list = MispronouncedWordGlobal.objects.filter(user=user)
        data = []
        for mw in mis_list:
            data.append({
                "id": mw.id,
                "word": mw.word,
                "accuracy": mw.accuracy,
                "created_at": mw.created_at.isoformat()
            })
        return Response(data, status=200)




# class MispronouncedWordsView(APIView):
#     """
#     GET /api/pronunciation/miswords/
#     Возвращает список всех MispronouncedWord у текущего пользователя,
#     сгруппированных / или простым массивом
#     """
#
#     def get(self, request):
#         user = request.user
#         if not user.is_authenticated:
#             return Response({"error": "Not authenticated"}, status=401)
# #  total_ex = ex_qs.values('exercise').distinct().count()
#         # Найдём все attempt у user
#         attempts = PronunciationAttempt.objects.filter(user=user)
#         # Найдём все miswords
#         miswords = MispronouncedWord.objects.filter(attempt__in=attempts, accuracy__lt=60)
#         data = []
#         for mw in miswords:
#             data.append({
#                 "id": mw.id,
#                 "word": mw.word,
#                 "accuracy": mw.accuracy,
#                 "attempt_id": mw.attempt_id,
#                 "exercise_title": mw.attempt.exercise.title,
#                 "created_at": mw.attempt.created_at.isoformat()
#             })
#         return Response(data)
# views.py
import os
import tempfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile

from .models import MispronouncedWordGlobal
from .utils_azure import convert_to_wav, analyze_pronunciation_azure  # или как вы их назвали

# class WordTrainingView(APIView):
#     """
#     POST /api/pronunciation/word-training/
#     form-data: { 'word':..., 'audio': @file }
#
#     Алгоритм:
#       1) user = request.user (должен быть авторизован)
#       2) word = request.data["word"]
#       3) audio_file = request.FILES["audio"]
#       4) сохраняем во временный .webm/.mp3 (NamedTemporaryFile)
#       5) convert_to_wav -> new .wav
#       6) analyze_pronunciation_azure
#       7) если score>=80 => удаляем запись из MispronouncedWordGlobal
#          иначе => обновляем accuracy (берём min)
#       8) вернуть JSON
#     """
#
#     def post(self, request):
#         user = request.user
#         if not user or not user.is_authenticated:
#             return Response({"error":"Not authenticated"}, status=401)
#
#         word_str = request.data.get("word", "").strip()
#         if not word_str:
#             return Response({"error":"No 'word' provided"}, status=400)
#
#         audio_file = request.FILES.get("audio")
#         if not audio_file:
#             return Response({"error":"No audio file provided"}, status=400)
#         if not isinstance(audio_file, UploadedFile):
#             return Response({"error":"Invalid 'audio' file"}, status=400)
#
#         # Попробуем найти запись в MispronouncedWordGlobal
#         try:
#             mw = MispronouncedWordGlobal.objects.get(user=user, word=word_str)
#         except MispronouncedWordGlobal.DoesNotExist:
#             return Response({"error":f"Word '{word_str}' not in your mispronounced list"}, status=404)
#
#         # 1) Сохраняем входной файл во временный .webm (например)
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
#             for chunk in audio_file.chunks():
#                 tmp_in.write(chunk)
#             input_path = tmp_in.name
#
#         converted_path = input_path + "_conv.wav"
#         try:
#             # 2) Конвертируем
#             convert_to_wav(input_path, converted_path)
#
#             # 3) Отправляем в azure
#             analysis = analyze_pronunciation_azure(converted_path, reference_text=word_str)
#             new_score = analysis["score"]  # или "accuracy_score", если вы так считаете нужным
#
#         except Exception as e:
#             # Ошибка ffmpeg или azure
#             # удаляем временные файлы
#             if os.path.exists(input_path):
#                 os.remove(input_path)
#             if os.path.exists(converted_path):
#                 os.remove(converted_path)
#             return Response({"error": str(e)}, status=500)
#         finally:
#             # подчистим входной файл
#             if os.path.exists(input_path):
#                 os.remove(input_path)
#
#         # converted_path тоже можно удалить, если не надо логов
#         if os.path.exists(converted_path):
#             os.remove(converted_path)
#
#         # 4) Смотрим результат
#         if new_score >= 80:
#             # удаляем запись (слово выучено)
#
#             mw.delete()
#
#
#             return Response({
#                 "message": f"Word '{word_str}' pronounced with score={new_score:.1f}. Removed from list.",
#                 "score": new_score
#             }, status=200)
#         else:
#             # слово всё ещё «плохое», возможно ниже accuracy
#             if new_score < mw.accuracy:
#                 mw.accuracy = new_score
#                 mw.save()
#             return Response({
#                 "message": f"Still not perfect. You got {new_score:.1f}. Keep practicing!",
#                 "score": new_score
#             }, status=200)
# views.py (или отдельный pronunciation/views_word_training.py)
import tempfile
import os
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from datetime import timedelta
from .models import MispronouncedWordGlobal
from .utils_azure import convert_to_wav, analyze_pronunciation_azure

class WordTrainingView(APIView):
    """
    POST /api/pronunciation/word-training/
    form-data: { 'word':..., 'audio': @file.wav or .webm }
    """
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        word_str = request.data.get("word", "").strip()
        audio_file = request.FILES.get("audio")
        if not word_str or not audio_file:
            return Response({"error": "Missing word or audio"}, status=400)
        if not isinstance(audio_file, UploadedFile):
            return Response({"error": "Invalid audio file"}, status=400)

        # Ищем в БД
        try:
            mw = MispronouncedWordGlobal.objects.get(user=user, word=word_str)
        except MispronouncedWordGlobal.DoesNotExist:
            return Response({"error": f"Word '{word_str}' not in mispronounced list"}, status=404)

        # --- перед обработкой проверяем, не истёк ли срок ---
        # (Вдруг user уже получил >=80 и прошло 5 мин.)
        if mw.reached_threshold_at:
            # check expiration
            delta = timezone.now() - mw.reached_threshold_at
            minutes_passed = delta.total_seconds() / 60
            if minutes_passed >= mw.expire_after_minutes:
                # считаем просроченным → удаляем
                mw.delete()
                return Response({
                    "message": f"Word '{word_str}' was already expired. Removed from list."
                }, status=200)

        # --- Обработка аудио ---
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
            for chunk in audio_file.chunks():
                tmp_in.write(chunk)
            input_path = tmp_in.name

        converted_path = input_path + "_conv.wav"
        try:
            convert_to_wav(input_path, converted_path)
            analysis = analyze_pronunciation_azure(converted_path, reference_text=word_str)
            new_score = analysis["score"]  # Можно accuracy_score, если так принято
        except Exception as e:
            # чистим за собой
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(converted_path):
                os.remove(converted_path)
            return Response({"error": f"Azure error: {str(e)}"}, status=500)
        finally:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(converted_path):
                os.remove(converted_path)

        # 4) Смотрим new_score
        if new_score >= 80:
            # Если раньше не достигал порога => выставляем reached_threshold_at
            if not mw.reached_threshold_at:
                mw.reached_threshold_at = timezone.now() + timedelta(minutes=2)
                mw.save()

            msg = f"Word '{word_str}' pronounced with score={new_score:.1f}. " \
                  f"You have {mw.expire_after_minutes} min to keep practicing."
            return Response({"message": msg, "score": new_score}, status=200)
        else:
            # Не достиг порога => обновляем accuracy (min)
            if new_score < mw.accuracy:
                mw.accuracy = new_score
                mw.save()
            msg = f"Still not perfect. You got {new_score:.1f}. Keep practicing!"
            return Response({"message": msg, "score": new_score}, status=200)


# class WordRemoveView(APIView):
#     """
#     DELETE /api/pronunciation/miswords/<word>/
#     Удаляем слово (user, word) из MispronouncedWordGlobal.
#     """
#
#     def delete(self, request, word=None):
#         user = request.user
#         if not user or not user.is_authenticated:
#             return Response({"error": "Not authenticated"}, status=401)
#
#         try:
#             mw = MispronouncedWordGlobal.objects.get(user=user, word=word)
#         except MispronouncedWordGlobal.DoesNotExist:
#             return Response({"error": f"Word '{word}' not found"}, status=404)
#
#         mw.delete()
#         return Response({"detail": f"Word '{word}' removed."}, status=200)

# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from celery.result import AsyncResult
#
# @api_view(["POST"])
# def start_analysis(request):
#     audio_path = request.data.get("audio_path")
#     reference_text = request.data.get("reference_text")
#
#     # Отправляем задачу в Celery
#     task = analyze_pronunciation_task.delay(audio_path, reference_text)
#
#     return Response({"task_id": task.id, "message": "Анализ запущен"})
#
#
# @api_view(["GET"])
# def get_task_status(request, task_id):
#     task_result = AsyncResult(task_id)
#     if task_result.state == "PENDING":
#         return Response({"status": "В обработке"})
#     elif task_result.state == "SUCCESS":
#         return Response({"status": "Готово", "result": task_result.result})
#     elif task_result.state == "FAILURE":
#         return Response({"status": "Ошибка", "error": str(task_result.result)})




from conversation.coqui_tts import synthesize_speech_b64
class ListenWordView(APIView):
    """
    GET /api/pronunciation/word-audio/?word=CAT
    Возвращает { "audio_b64": "..." }
    """
    def get(self, request):
        word = request.GET.get("word", "")
        if not word:
            return Response({"error": "No word"}, status=400)

        # Генерируем TTS (base64)
        audio_b64 = synthesize_speech_b64(word)  # например, Coqui TTS
        return Response({"audio_b64": audio_b64}, status=200)
