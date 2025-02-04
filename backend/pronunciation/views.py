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


LEVELS_AVAILABLE = ['Beginner', 'Intermediate', 'Advanced']


class PronunciationLevelsView(APIView):
    def get(self, request):
        # Просто возвращаем массив уровней
        return Response(LEVELS_AVAILABLE)


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
        overall_score = analysis["score"]
        accuracy_score = analysis["accuracy_score"]
        fluency_score = analysis["fluency_score"]
        completeness_score = analysis["completeness_score"]
        recognized_text = analysis["recognized_text"]
        words_detail = analysis["words"]
        xp_data = None

        if user.is_authenticated:
            with transaction.atomic():
                attempt = PronunciationAttempt.objects.create(
                    user=user,
                    exercise=exercise,
                    score=overall_score,
                    recognized_text=recognized_text
                )
                if overall_score >= 80:
                    xp_data = award_xp(user, 10)
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
        else:
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
        return Response(resp_data,
                        status=200)


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
