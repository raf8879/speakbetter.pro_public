# # pronunciation/g2p_utils.py
# import re
# import re
# from g2p_en import G2p
#
# _g2p = G2p()
#
# def word_to_phonemes(word: str) -> list[str]:
#     raw_phones = _g2p(word)
#     # Уберём не-фонемные
#     phonemes = [p for p in raw_phones if re.match(r"[A-Z]", p, re.IGNORECASE)]
#     return phonemes
#
#
# def phrase_to_phonemes(phrase: str) -> list[str]:
#     words = phrase.split()
#     all_phonemes = []
#     for i, w in enumerate(words):
#         p = word_to_phonemes(w)
#         if i > 0:
#             all_phonemes.append('|')
#         all_phonemes.extend(p)
#     return all_phonemes
