from conversation.coqui_tts import synthesize_speech_b64

def get_word_audio_b64(word: str) -> str:
    """
    Возвращает base64-encoded WAV (правильное произношение).
    """
    return synthesize_speech_b64(word)
