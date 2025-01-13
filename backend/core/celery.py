# from __future__ import absolute_import, unicode_literals
# import os
# from celery import Celery
#
# # Установите Django settings в качестве конфигурации для Celery
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
#
# app = Celery("core")
#
# # Читает настройки Celery из Django settings с префиксом "CELERY_"
# app.config_from_object("django.conf:settings", namespace="CELERY")
#
# # Автоматическое обнаружение задач в приложениях Django
# app.autodiscover_tasks()
#
# @app.task(bind=True)
# def debug_task(self):
#     print(f"Request: {self.request!r}")
