import os
import hashlib
import tempfile
import base64

from django.core.cache import cache
from TTS.api import TTS

MODEL_NAME = "tts_models/en/vctk/vits"
print(f"Loading Coqui TTS model: {MODEL_NAME} ...")
tts_model = TTS(model_name=MODEL_NAME)
print("Coqui TTS model loaded!")

# Посмотрим, какие есть колонки (спикеры).
print("Available speakers:", tts_model.speakers)
# Пример вывода: ["p225", "p227", "p229", ...]

def synthesize_speech(text: str, speaker: str = None) -> bytes:
    """
    Синтезирует речь из текста (text), возвращает сырые WAV-данные.
    speaker: можно указать "p225" или другое, если нужно конкретное имя.
    Если None, берём по умолчанию первый спикер.
    """
    # Проверим, является ли модель мультиспикерной.
    if tts_model.is_multi_speaker:
        # Если пользователь не указал speaker, берём первого из списка.
        # (Или можно прописать конкретно "p225" — на ваше усмотрение.)
        if not speaker:
            speaker = tts_model.speakers[0]
            # Например, "p225"

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
        wav_path = tmp_wav.name

    # Добавим speaker, если он есть
    if speaker:
        tts_model.tts_to_file(text=text, file_path=wav_path, speaker=speaker)
    else:
        # Если это не мультиспикерная модель, просто:
        tts_model.tts_to_file(text=text, file_path=wav_path)

    with open(wav_path, "rb") as f:
        wav_data = f.read()
    os.remove(wav_path)
    return wav_data

def synthesize_speech_cached(text: str, speaker: str = None) -> bytes:
    """
    Синтез с кэшированием. Ключ кэша учитывает и текст, и speaker.
    """
    text_hash = hashlib.md5((text + str(speaker)).encode("utf-8")).hexdigest()
    cache_key = f"coqui_tts:{text_hash}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    wav_data = synthesize_speech(text, speaker)
    cache.set(cache_key, wav_data, timeout=86400)
    return wav_data

def synthesize_speech_b64(text: str, speaker: str = None) -> str:
    wav_data = synthesize_speech_cached(text, speaker)
    return base64.b64encode(wav_data).decode("utf-8")
