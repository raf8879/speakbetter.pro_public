#FROM python:3.11-slim
#
#WORKDIR /app
#
## Копируем только requirements.txt и устанавливаем зависимости
#COPY requirements.txt /app/requirements.txt
#RUN apt-get update && apt-get install -y \
#    ffmpeg \
#    espeak \
#    sox \
#    swig \
#    libicu-dev \
#    libsndfile1 \
##    build-essential \
#    && rm -rf /var/lib/apt/lists/*
#RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
#
#RUN pip install --no-cache-dir --upgrade pip setuptools wheel

#
## Не копируем весь код, так как будем использовать volume.
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]



# 1) Берём готовый образ MFA
#FROM mmcauliffe/montreal-forced-aligner:v2.2.15
# 2) Если нужно, добавляем системные пакеты (ffmpeg, espeak, sox, и т.д.).
#    В зависимости от того, какая база у MFA-образа,
#    обычно это Debian/Ubuntu, значит apt-get доступен.
#    Если что-то уже есть в образе, эти команды можно убрать.

# 2) Убедимся, что команды выполняются от имени root
#USER root
#
#ENV DEBIAN_FRONTEND=noninteractive
#
#
#RUN apt-get update && apt-get install -y \
#    ffmpeg \
#    espeak \
#    sox \
##    swig \
##    libicu-dev \
##    libsndfile1 \
#    && echo "Packages installed successfully" \
#    && rm -rf /var/lib/apt/lists/*
#
## 3) Создаём рабочую папку /app
#WORKDIR /app
#
## 4) Копируем только requirements.txt (код не копируем, т.к. volume)
#COPY requirements.txt /app/requirements.txt
#
## 5) Устанавливаем Python-пакеты в conda-окружение "aligner"
##    (которое уже создано в официальном MFA-образе)
#RUN conda run -n aligner pip install --no-cache-dir --default-timeout=1000 -r /app/requirements.txt \
#    && conda clean --all -f -y
#
## (Опционально) Скачиваем акустические/словарные модели MFA,
## чтобы не качать их на каждом запуске:
#RUN conda run -n aligner mfa model download acoustic english_us_arpa
#RUN conda run -n aligner mfa model download dictionary english_us_arpa
#
## 6) Не копируем ваш код - вы используете volume. При runtime
##    вы замапите свою папку в /app, где лежит manage.py.
#
## 7) Запуск Django
#CMD ["conda", "run", "-n", "aligner", "python", "manage.py", "runserver", "0.0.0.0:8000"]


#FROM mmcauliffe/montreal-forced-aligner:v2.2.15
#
#USER root
#ENV DEBIAN_FRONTEND=noninteractive
#
#RUN apt-get update && apt-get install -y ffmpeg espeak sox && rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app
#COPY requirements.txt /app/requirements.txt
#
#RUN conda run -n mfa pip install --no-cache-dir --default-timeout=1000 -r /app/requirements.txt \
#    && conda clean --all -f -y
#
#RUN conda run -n mfa mfa model download acoustic english_us_arpa
#RUN conda run -n mfa mfa model download dictionary english_us_arpa
#
#CMD ["conda", "run", "-n", "mfa", "python", "manage.py", "runserver", "0.0.0.0:8000"]


#FROM mmcauliffe/montreal-forced-aligner:v2.2.15
#USER root
#
## Отключаем интерактивный режим для apt-get
#ENV DEBIAN_FRONTEND=noninteractive
#
## Устанавливаем системные зависимости
#RUN apt-get update && apt-get install -y \
#    ffmpeg \
#    espeak \
#    sox \
#    && rm -rf /var/lib/apt/lists/*
#
## Устанавливаем Python 3.11 через conda
#RUN conda install -n base python=3.11 -y
#
## Создаём conda-окружение aligner с Python 3.11
#RUN conda create -n aligner python=3.11 -y
#
## Активируем окружение aligner и устанавливаем зависимости
#RUN conda run -n aligner pip install --no-cache-dir -r /app/requirements.txt \
#    && conda clean --all -f -y
#
## Устанавливаем рабочую директорию
#WORKDIR /app
#
## Копируем requirements.txt
#COPY requirements.txt /app/requirements.txt

#FROM mmcauliffe/montreal-forced-aligner:v2.2.15
#
#USER root
#ENV DEBIAN_FRONTEND=noninteractive
#
#RUN apt-get update && apt-get install -y \
#    ffmpeg \
#    espeak \
#    sox \
#    && rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app
#COPY requirements.txt /app/requirements.txt
#
## Просто pip install в системную (либо conda-base) Python
#RUN pip install --no-cache-dir --default-timeout=1000 -r /app/requirements.txt
#
#RUN mfa model download acoustic english_us_arpa
#RUN mfa model download dictionary english_us_arpa
#
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# 1) Базовый образ
#FROM python:3.11-slim
#
## 2) Переменные окружения
#ENV DEBIAN_FRONTEND=noninteractive
#ENV CONDA_DIR=/opt/conda
#ENV PATH=$CONDA_DIR/bin:$PATH
#
## 3) Установка системных пакетов
##    (ffmpeg, sox, espeak - если нужны для TTS/аудио).
#RUN apt-get update && apt-get install -y \
#    wget bzip2 \
#    ffmpeg \
#    espeak \
#    sox \
#    && rm -rf /var/lib/apt/lists/*
#
## 4) Установка Miniconda
#RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh \
#    && /bin/bash /tmp/miniconda.sh -b -p $CONDA_DIR \
#    && rm /tmp/miniconda.sh \
#    && conda clean -a -f -y
#
#
## 5) Создаём рабочую директорию
#WORKDIR /app
#
## 6) Настройка conda и установка MFA
##    - Добавляем канал conda-forge
##    - Создаём окружение "aligner"
##    - Устанавливаем последнюю версию MFA (>=3.2.x)
#RUN conda config --add channels conda-forge && \
#    conda create -n aligner -y montreal-forced-aligner && \
#    conda clean --all -f -y
#
## 7) (Опционально) Установка PyTorch, Whisper, Coqui TTS, Django и т.д.
##    Вы можете прописать всё прямо здесь ИЛИ использовать requirements.txt.
##    Ниже пример установки через pip внутри окружения aligner:
##    !!! ВАЖНО: если вам нужна CPU-версия PyTorch, укажите +cpu и соответствующий индекс.
##RUN conda run -n aligner pip install --no-cache-dir \
##    torch==2.0.1+cpu \
##    torchaudio==2.0.1+cpu \
##    --extra-index-url https://download.pytorch.org/whl/cpu \
##    git+https://github.com/openai/whisper.git \
##    coqui-tts==1.14.0 \
##    django==4.2 \
##    djangorestframework==3.14.0 \
##    textgrid==1.2 \
##    # Дописать любые пакеты, которые нужны для вашего проекта
##    && conda clean --all -f -y
#
## (Вариант) Если у вас есть requirements.txt, можно:
#COPY requirements.txt /app/requirements.txt
#RUN conda run -n aligner pip install -r /app/requirements.txt
#
## 8) (Опционально) Скачиваем модели для MFA (English acoustic dict) заранее
#RUN conda run -n aligner mfa model download acoustic english_us_arpa
#RUN conda run -n aligner mfa model download dictionary english_us_arpa
#
## 9) Копируем код - если вы НЕ используете volume. ИЛИ пропустите, если volume.
## COPY . /app
#
## 10) Запуск Django
##     Если ваш код (manage.py) в /app, эта команда активирует conda-окружение
##     и запускает сервер на 0.0.0.0:8000
#CMD ["conda", "run", "-n", "aligner", "python", "-u", "manage.py", "runserver", "0.0.0.0:8000"]



#FROM python:3.11-slim
#
#ENV DEBIAN_FRONTEND=noninteractive
#
## Установка системных пакетов
#RUN apt-get update && apt-get install -y wget bzip2 ffmpeg espeak sox && rm -rf /var/lib/apt/lists/*

# Установка Miniconda
#ENV CONDA_DIR=/opt/conda
#ENV PATH=$CONDA_DIR/bin:$PATH
#
#RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh \
#    && /bin/bash /tmp/miniconda.sh -b -p $CONDA_DIR \
#    && rm /tmp/miniconda.sh \
#    && conda clean -a -f -y
#
#WORKDIR /app
#
#RUN conda config --add channels conda-forge \
#    && conda create -n aligner -y montreal-forced-aligner \
#    && conda clean --all -f -y
#
## Активируем окружение aligner по умолчанию (копируем бинарники в PATH)
#ENV PATH=$CONDA_DIR/envs/aligner/bin:$PATH
## теперь "python", "mfa" и т.д. будет из окружения aligner
#
#COPY requirements.txt /app/requirements.txt
#RUN pip install --no-cache-dir -r requirements.txt
#
## скачиваем модели
#RUN mfa model download acoustic english_us_arpa
#RUN mfa model download dictionary english_us_arpa
#
## копируем код (или используем volume)
## COPY . /app
#
## выставляем переменную, чтобы Python не буферизовал
#ENV PYTHONUNBUFFERED=1
#
#CMD ["python", "-u", "manage.py", "runserver", "0.0.0.0:8000"]


#FROM python:3.11-slim
#
#ENV DEBIAN_FRONTEND=noninteractive
#RUN apt-get update && apt-get install -y \
#    ffmpeg \
#    sox \
#    espeak \
#    && rm -rf /var/lib/apt/lists/*
#
## (Опционально) PYTHONUNBUFFERED=1, чтобы логи сразу шли в stdout
#ENV PYTHONUNBUFFERED=1
#
#WORKDIR /app
#
#COPY requirements.txt /app/requirements.txt
#
#RUN pip install --no-cache-dir --default-timeout=1000 -r /app/requirements.txt
#
## Если нужно собрать whisper c git:
## RUN pip install git+https://github.com/openai/whisper.git
#
## Копируем остальной код (или используем volume)
## COPY . /app
#
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

#########work last version$+######################
#FROM python:3.11-slim
#
#ENV DEBIAN_FRONTEND=noninteractive
#RUN apt-get update && apt-get install -y ffmpeg sox espeak && rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app
#
#COPY requirements.txt /app/requirements.txt
#RUN pip install --no-cache-dir --upgrade pip
#RUN pip install --no-cache-dir --default-timeout=1000 -r /app/requirements.txt
#
## ВАЖНО: скачиваем nltk-модели (averaged_perceptron_tagger)
##RUN python -m nltk.downloader averaged_perceptron_tagger
#
## Если g2p-en запрашивает averaged_perceptron_tagger_eng,
## иногда надо так (но обычно "averaged_perceptron_tagger" хватает):
## RUN python -m nltk.downloader averaged_perceptron_tagger_eng
#
## Остальной код
#COPY . /app
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# backend/Dockerfile
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
