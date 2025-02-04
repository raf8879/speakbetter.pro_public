import whisper
import os


WHISPER_MODEL = whisper.load_model("base.en")  # "tiny", "base", "small", etc.

def transcribe_with_words(audio_path: str, language="en") -> dict:
    """
    Возвращает структуру:
      {
        "text": "...",
        "words": [
          { "word":"Hello", "start":0.5, "end":0.8 },
          ...
        ]
      }
    Используем segment timestamps, разбиваем segment.text на слова (грубая логика).
    """
    result = WHISPER_MODEL.transcribe(audio_path, task="transcribe", language=language)
    all_text = result["text"].strip()
    all_words = []

    for seg in result["segments"]:
        seg_text = seg["text"].strip()
        seg_start = seg["start"]
        seg_end = seg["end"]

        words = seg_text.split()
        if not words:
            continue
        seg_len = seg_end - seg_start
        word_dur = seg_len / len(words)

        current_start = seg_start
        for w in words:
            w_end = current_start + word_dur
            all_words.append({
                "word": w,
                "start": current_start,
                "end": w_end
            })
            current_start = w_end

    return {
        "text": all_text,
        "words": all_words
    }


def compute_score_from_alignment(alignment: list) -> (float, list):
    """
    alignment: [{"word":"Hello","start":0.5,"end":1.0}, ...]
    Возвращает:
      score (0..100),
      words_detail [{word, start_time, end_time, status, accuracy}, ...]
    Пример: если (end-start)<0.1 => mispronounced
    """
    total_words = len(alignment)
    if total_words == 0:
        return 0.0, []

    words_detail = []
    mispronounced_count = 0

    for w in alignment:
        wdur = w["end"] - w["start"]
        if wdur < 0.1:
            status = "mispronounced"
            acc = 0.0
            mispronounced_count += 1
        else:
            status = "ok"
            acc = 1.0
        w_info = {
            "word": w["word"],
            "start_time": w["start"],
            "end_time": w["end"],
            "status": status,
            "accuracy": acc
        }
        words_detail.append(w_info)

    correct_count = total_words - mispronounced_count
    score_percent = (correct_count / total_words)*100
    return round(score_percent, 2), words_detail
