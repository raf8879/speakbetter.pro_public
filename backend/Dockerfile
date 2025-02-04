FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y ffmpeg sox espeak git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Установим зависимости
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
#RUN python -c "from TTS.api import TTS; TTS(model_name='tts_models/en/vctk/vits')"

# Если нужны модели nltk, PyTorch, TTS, etc., они должны быть в requirements.txt
# (Или install torch + coqui TTS, whisPer... уже у вас прописано).

# Скопируем весь проект
COPY . /app
RUN python manage.py collectstatic --noinput
# В продакшене используем Gunicorn
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "300"]
