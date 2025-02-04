from django.apps import AppConfig
import os


class PronunciationConfig(AppConfig):
    name = 'pronunciation'

    def ready(self): 
        print("Pronunciation app is ready!")


