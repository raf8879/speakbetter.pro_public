import os
import subprocess
import logging
import azure.cognitiveservices.speech as speechsdk

logging.basicConfig(level=logging.INFO)

def convert_to_wav(input_path: str, output_path: str):
    """
    Конвертирует входной аудиофайл (webm/mp3/opus/etc.) в PCM WAV (16kHz, mono).
    Требует установленного ffmpeg в среде.
    """
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        "-f", "wav",
        output_path
    ]
    try:
        subprocess.run(cmd, check=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffmpeg error: {e.stderr.decode().strip()}")

def analyze_pronunciation_azure(wav_path: str, reference_text: str, language: str = "en-US"):
    """
    Анализирует произношение через Azure.
    Возвращает метрики: общий балл, точность, беглость, полнота, текст и слова.
    """
    speech_key = os.environ.get('AZURE_SPEECH_KEY')
    service_region = os.environ.get('AZURE_SERVICE_REGION')
    if not speech_key or not service_region:
        raise RuntimeError("AZURE_SPEECH_KEY / AZURE_SERVICE_REGION not set")

    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.speech_recognition_language = language

    pron_config = speechsdk.PronunciationAssessmentConfig(
        reference_text=reference_text,
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Word,
        enable_miscue=True
    )
    audio_config = speechsdk.AudioConfig(filename=wav_path)
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    pron_config.apply_to(recognizer)

    logging.info(f"Starting pronunciation analysis for file: {wav_path}")
    result = recognizer.recognize_once()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        pa_result = speechsdk.PronunciationAssessmentResult(result)
        overall_score = pa_result.pronunciation_score or 0.0
        accuracy_score = pa_result.accuracy_score or 0.0
        fluency_score = pa_result.fluency_score or 0.0
        completeness_score = pa_result.completeness_score or 0.0

        recognized_text = result.text or ""

        words_detail = []
        for w in pa_result.words:
            words_detail.append({
                "word": w.word,
                "score": w.accuracy_score,
                "error_type": w.error_type
            })

        logging.info(f"Pronunciation score: {overall_score}, Accuracy: {accuracy_score}, Fluency: {fluency_score}")
        return {
            "score": overall_score,
            "accuracy_score": accuracy_score,
            "fluency_score": fluency_score,
            "completeness_score": completeness_score,
            "recognized_text": recognized_text,
            "words": words_detail
        }
    elif result.reason == speechsdk.ResultReason.Canceled:
        c = result.cancellation_details
        raise RuntimeError(f"Azure Speech canceled. reason={c.reason}, error_details={c.error_details}")
    else:
        raise RuntimeError(f"Azure Speech failed. reason={result.reason}")


