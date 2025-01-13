# # pronunciation/utils.py
#
# def compute_score_from_alignment(alignment: list) -> (float, list):
#     """
#     alignment: список слов [{"word":..., "start_time":..., "end_time":...}, ...]
#     Возвращает (score, words_detail), где:
#       score: float (0..100)
#       words_detail: [{"word":"cat","start_time":0.4,"end_time":0.7,"status":"ok","accuracy":1.0}, ...]
#     Пример логики: если (end-start)<0.1 -> считаем "mispronounced".
#     """
#
#     total_words = len(alignment)
#     if total_words == 0:
#         return (0.0, [])
#
#     words_detail = []
#     mispronounced_count = 0
#
#     for w in alignment:
#         wdur = w["end_time"] - w["start_time"]
#         # Простая логика:
#         if wdur < 0.1:
#             status = "mispronounced"
#             acc = 0.0
#             mispronounced_count += 1
#         else:
#             status = "ok"
#             acc = 1.0
#         w_info = {
#             "word": w["word"],
#             "start_time": w["start_time"],
#             "end_time": w["end_time"],
#             "status": status,
#             "accuracy": acc
#         }
#         words_detail.append(w_info)
#
#     # score = процент правильно произнесённых слов
#     correct_count = total_words - mispronounced_count
#     score_percent = (correct_count / total_words) * 100
#
#     return (round(score_percent, 2), words_detail)
