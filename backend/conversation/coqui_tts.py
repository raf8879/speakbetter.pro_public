#local version TTS
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
##################################################
# import os
# import hashlib
# import base64
# from django.core.cache import cache
# import azure.cognitiveservices.speech as speechsdk
#
# # Рекомендуется выносить в настройки/конфиг:
# AZURE_SPEECH_KEY = os.environ.get('AZURE_SPEECH_KEY')
# AZURE_SPEECH_REGION = os.environ.get('AZURE_SERVICE_REGION')
#
# # Проверим наличие ключа
# if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
#     raise RuntimeError("Azure Speech key/region not provided. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION env vars.")
#
# # Допустим, хотим ограничить длину текста (например, 3000 символов),
# # чтобы не отправлять гигантские запросы.
# MAX_TTS_TEXT_LENGTH = 3000
#
# # ======================
# # Основная функция synthesize_speech
# # ======================
# def synthesize_speech(text: str, speaker: str = None) -> bytes:
#     """
#     Синтезирует речь из текста, возвращая сырые WAV-данные (16-bit PCM).
#     Внутри вызывается Azure Speech API через пакет azure-cognitiveservices-speech.
#
#     :param text: Текст для синтеза.
#     :param speaker: Имя голоса (voice name) в Azure, например: "en-US-AriaNeural".
#                     Если None, используем некий дефолт, например "en-US-JennyNeural".
#     :return: bytes (raw WAV data).
#     """
#     # 1) Проверка длины
#     if len(text) > MAX_TTS_TEXT_LENGTH:
#         raise ValueError(f"TTS text is too long ({len(text)} chars). Max allowed is {MAX_TTS_TEXT_LENGTH}.")
#
#     # 2) Создаём speech_config (подключаемся к Azure)
#     speech_config = speechsdk.SpeechConfig(
#         subscription=AZURE_SPEECH_KEY,
#         region=AZURE_SPEECH_REGION
#     )
#     # Выберем формат вывода: Riff16Khz16BitMonoPcm или другой (по умолчанию часто 16 kHz WAV).
#     # Можно не указывать, но для WAV/PCM удобно:
#     speech_config.set_speech_synthesis_output_format(
#         speechsdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm
#     )
#
#     # Если хотим указать voice-name (speaker):
#     # Список голосов: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=stt-tts
#     voice_name = speaker if speaker else "en-US-JennyNeural"
#     speech_config.speech_synthesis_voice_name = voice_name
#
#     # 3) Куда писать аудио: в память.
#     # Для этого используем SpeechSynthesisOutputFormat + метод get_audio_data
#     audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
#
#     # Создаём синтезатор
#     synthesizer = speechsdk.SpeechSynthesizer(
#         speech_config=speech_config,
#         audio_config=audio_config
#     )
#
#     # 4) Вызываем speak_text_async
#     result = synthesizer.speak_text_async(text).get()
#
#     # 5) Проверяем причину
#     if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
#         # забираем WAV-данные
#         audio_data = result.audio_data
#         return audio_data
#     else:
#         # Можно логировать, бросать ошибку, и т.д.
#         error_msg = f"Azure TTS failed, reason={result.reason}, error={result.cancellation_details if result.cancellation_details else ''}"
#         raise RuntimeError(error_msg)
#
# # ======================
# # Вспомогательная функция: кэшированный синтез
# # ======================
# def synthesize_speech_cached(text: str, speaker: str = None) -> bytes:
#     """
#     То же самое, но с кэшированием (в Django cache).
#     Генерируем ключ кэша на основе (text, speaker).
#     """
#     # Генерируем хеш
#     text_hash = hashlib.md5((text + str(speaker)).encode("utf-8")).hexdigest()
#     cache_key = f"azure_tts:{text_hash}"
#     cached_data = cache.get(cache_key)
#     if cached_data:
#         return cached_data
#
#     # Если нет в кэше
#     wav_data = synthesize_speech(text, speaker)
#     cache.set(cache_key, wav_data, timeout=86400)  # сутки
#     return wav_data
#
# # ======================
# # Вспомогательная функция: вернём base64
# # ======================
# def synthesize_speech_b64(text: str, speaker: str = None) -> str:
#     """
#     Возвращает base64-строку WAV-файла (16 kHz PCM), закодированную в base64.
#     Подходящую, например, для JSON-ответа.
#     """
#     wav_data = synthesize_speech_cached(text, speaker)
#     return base64.b64encode(wav_data).decode("utf-8")
