# pronunciation/tts_utils.py
# (Если хотите продублировать в этом же приложении,
#  или просто импортировать из conversation.coqui_tts)

from conversation.coqui_tts import synthesize_speech_b64

def get_word_audio_b64(word: str) -> str:
    """
    Возвращает base64-encoded WAV (правильное произношение).
    """
    return synthesize_speech_b64(word)
