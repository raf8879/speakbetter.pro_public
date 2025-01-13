import pyttsx3

# def text_to_speech(text: str, out_path: str):
#     engine = pyttsx3.init()
#     # engine.setProperty('rate', 150)  # если хотите поменять скорость
#     engine.save_to_file(text, out_path)
#     engine.runAndWait()


# def text_to_speech(text: str, out_path: str):
#     print("DEBUG: Entered text_to_speech with text=", text)
#     engine = pyttsx3.init()
#     print("DEBUG: engine created")
#     engine.save_to_file(text, out_path)
#     engine.runAndWait()
#     print("DEBUG: runAndWait done")
#     engine.stop()
#     print("DEBUG: engine stopped")

# tts_utils.py
import pyttsx3
import threading

_lock = threading.Lock()

# Инициализируем движок один раз глобально
_engine = pyttsx3.init()

# Можно настроить голос и пр. сразу здесь (или внутри функции, но один раз)
voices = _engine.getProperty('voices')
for v in voices:
    if "en" in v.id.lower() or "english" in v.name.lower():
        _engine.setProperty('voice', v.id)
        break

def text_to_speech(text, out_path):
    """
    Генерирует аудиофайл с озвучкой 'text' и сохраняет его в 'out_path'.
    """
    with _lock:
        # Используем один глобальный engine
        _engine.save_to_file(text, out_path)
        _engine.runAndWait()
