##########whisper local work virsion#######################
import whisper


WHISPER_MODEL = None

def load_whisper_model():
    global WHISPER_MODEL
    if WHISPER_MODEL is None:
        # Можно "tiny" или "base" в зависимости от нужной точности / скорости
        WHISPER_MODEL = whisper.load_model("base.en")
        print("Whisper model loaded!")

def transcribe_file(filepath: str) -> str:
    if WHISPER_MODEL is None:
        raise RuntimeError("Whisper model not loaded!")
    result = WHISPER_MODEL.transcribe(filepath, language="en")
    return result["text"]


#################################################
# import os
# import requests
# import hashlib
# from django.core.cache import cache
# from typing import Optional
#
# # Настройки:
# WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"
# WHISPER_API_KEY = os.environ.get("OPENAI_API_KEY", "")
# MAX_AUDIO_FILE_SIZE = 5 * 1024 * 1024  # 25 MB (пример ограничения)
#
# def transcribe_file(filepath: str) -> str:
#     """
#     Отправляет аудиофайл (wav/mp3/ogg и т.д.) на OpenAI Whisper API, возвращает расшифрованный текст (английский).
#     Если хотите другой язык - можно указать "language":"xx".
#     """
#
#     # 1) Проверка ключа
#     if not WHISPER_API_KEY:
#         raise RuntimeError("OPENAI_API_KEY не установлен в окружении")
#
#     # 2) Проверка размера (чтобы не отправлять очень большие файлы)
#     size = os.path.getsize(filepath)
#     if size > MAX_AUDIO_FILE_SIZE:
#         raise ValueError(f"Файл {filepath} слишком большой ({size} байт), макс: {MAX_AUDIO_FILE_SIZE} байт")
#
#     # 3) Формируем запрос
#     with open(filepath, "rb") as audio_file:
#         files = {
#             "file": (os.path.basename(filepath), audio_file, "audio/wav"),
#         }
#         data = {
#             "model": "whisper-1",
#             "language": "en",  # только английский
#         }
#         headers = {
#             "Authorization": f"Bearer {WHISPER_API_KEY}",
#         }
#
#         # Можно добавить timeout
#         try:
#             resp = requests.post(
#                 WHISPER_API_URL,
#                 headers=headers,
#                 data=data,
#                 files=files,
#                 timeout=120  # 2 мин
#             )
#         except requests.RequestException as e:
#             raise RuntimeError(f"Не удалось связаться с OpenAI Whisper API: {str(e)}")
#
#         if resp.status_code == 200:
#             js = resp.json()
#             return js.get("text", "")
#         else:
#             raise RuntimeError(f"Whisper API error: {resp.status_code}, {resp.text}")
#
#
# def transcribe_file_cached(filepath: str) -> str:
#     """
#     Та же логика, но с кэшированием.
#     Для кэша используем хеш от файла (md5).
#     """
#     # Считаем хеш файла
#     h = md5_file(filepath)
#     cache_key = f"whisper_file:{h}"
#     cached_text = cache.get(cache_key)
#     if cached_text is not None:
#         return cached_text
#
#     # Иначе делаем реальный вызов
#     text = transcribe_file(filepath)
#     cache.set(cache_key, text, 24*3600)  # 24 часа
#     return text
#
#
# def md5_file(path: str) -> str:
#     """Хелпер: возвращает md5-хеш содержимого файла."""
#     md = hashlib.md5()
#     with open(path, "rb") as f:
#         for chunk in iter(lambda: f.read(8192), b""):
#             md.update(chunk)
#     return md.hexdigest()
