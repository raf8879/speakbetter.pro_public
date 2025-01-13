# from celery import shared_task
# from .utils_azure import analyze_pronunciation_azure
# from .models import PronunciationAttempt, MispronouncedWord, PronunciationExercise
# from django.db import transaction
# import os
# import logging
#
# logger = logging.getLogger(__name__)
#
# @shared_task
# def analyze_pronunciation_task(audio_path, reference_text, exercise_id, user_id=None):
#     try:
#         # Проверяем существование файла
#         if not os.path.exists(audio_path):
#             raise FileNotFoundError(f"Audio file not found: {audio_path}")
#
#         # Выполняем анализ
#         result = analyze_pronunciation_azure(audio_path, reference_text)
#
#         # Удаляем файл после анализа
#         if os.path.exists(audio_path):
#             os.remove(audio_path)
#
#         return result
#
#     except Exception as e:
#         # Удаляем файл в случае ошибки
#         if os.path.exists(audio_path):
#             os.remove(audio_path)
#         raise e
