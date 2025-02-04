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
