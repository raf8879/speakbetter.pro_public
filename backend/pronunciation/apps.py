
from django.apps import AppConfig
import os


class PronunciationConfig(AppConfig):
    name = 'pronunciation'

    def ready(self):
        # При запуске Django можно что-то инициализировать,
        # например, проверить наличие MFA-моделей или Coqui TTS.
        print("Pronunciation app is ready!")
        # Если используете MFA, проверьте пути к моделям (ACOUSTIC_MODEL_PATH, etc.)
        # if not os.path.exists(ACOUSTIC_MODEL_PATH):
        #     print("WARNING: MFA acoustic model not found!")
        # ...

