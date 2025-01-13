# # pronunciation/distance_utils.py
# import Levenshtein
# from .g2p_utils import phrase_to_phonemes
#
# def phoneme_distance_score(ref_text: str, hyp_text: str) -> float:
#     ref_phones = phrase_to_phonemes(ref_text.lower())
#     hyp_phones = phrase_to_phonemes(hyp_text.lower())
#     ref_str = " ".join(ref_phones)
#     hyp_str = " ".join(hyp_phones)
#     dist = Levenshtein.distance(ref_str, hyp_str)
#     max_len = max(len(ref_str), len(hyp_str))
#     if max_len == 0:
#         return 1.0 if dist == 0 else 0.0
#     return 1.0 - dist / max_len
#


# import Levenshtein
# from .g2p_utils import phrase_to_phonemes
#
# def phoneme_distance_score(ref_text: str, hyp_text: str) -> float:
#     """
#     Возвращает float [0..1], показывающий «насколько» похоже
#     (1.0 = идентично, 0.0 = совсем другое).
#     """
#     ref_phones = phrase_to_phonemes(ref_text.lower())
#     hyp_phones = phrase_to_phonemes(hyp_text.lower())
#     ref_str = " ".join(ref_phones)
#     hyp_str = " ".join(hyp_phones)
#
#     dist = Levenshtein.distance(ref_str, hyp_str)
#     max_len = max(len(ref_str), len(hyp_str))
#     if max_len == 0:
#         return 1.0 if dist == 0 else 0.0
#
#     ratio = 1.0 - dist / max_len
#     return ratio
