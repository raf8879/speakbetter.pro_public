from django.apps import AppConfig


class ConversationConfig(AppConfig):
    name = 'conversation'

    def ready(self):
        # Загружаем Whisper
        from .whisper_utils import load_whisper_model
        load_whisper_model()

        # Импортируем coqui_tts, чтобы модель подгрузилась
        from . import coqui_tts
        print("Coqui TTS and Whisper models are loaded!")
