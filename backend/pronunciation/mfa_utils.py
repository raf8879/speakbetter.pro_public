# import subprocess, os, tempfile, shutil
# from textgrid import TextGrid
#
# ACOUSTIC_MODEL_PATH = "/root/Documents/MFA/pretrained_models/acoustic/english_us_arpa.zip"
# DICTIONARY_PATH = "/root/Documents/MFA/pretrained_models/dictionary/english_us_arpa.dict"
#
#
# def run_mfa_alignment(audio_path: str, text_content: str) -> list:
#     temp_dir = tempfile.mkdtemp()
#     corpus_dir = os.path.join(temp_dir, "corpus")
#     out_dir = os.path.join(temp_dir, "out_dir")
#
#     os.makedirs(corpus_dir, exist_ok=True)
#     os.makedirs(out_dir,   exist_ok=True)
#
#     # 1) Копируем audio
#     basename = "input"
#     audio_filename = os.path.join(corpus_dir, f"{basename}.wav")
#     shutil.copy(audio_path, audio_filename)
#
#     # 2) Создаем input.lab
#     text_filename = os.path.join(corpus_dir, f"{basename}.lab")
#     with open(text_filename, "w", encoding="utf-8") as f:
#         f.write(text_content)
#
#     cmd = [
#         "mfa", "align",
#         corpus_dir,
#         DICTIONARY_PATH,
#         ACOUSTIC_MODEL_PATH,
#         out_dir
#     ]
#     print(">>> run_mfa_alignment command:", cmd, flush=True)
#     print(">>> corpus_dir content:", os.listdir(corpus_dir), flush=True)
#
#     try:
#         result = subprocess.run(cmd, check=True, capture_output=True, text=True)
#         print(">>> MFA STDOUT:", result.stdout, flush=True)
#         print(">>> MFA STDERR:", result.stderr, flush=True)
#     except subprocess.CalledProcessError as e:
#         print(">>> MFA alignment error, returncode:", e.returncode, flush=True)
#         print(">>> MFA STDOUT:", e.stdout, flush=True)
#         print(">>> MFA STDERR:", e.stderr, flush=True)
#         shutil.rmtree(temp_dir, ignore_errors=True)
#         raise RuntimeError(f"MFA alignment error: {str(e)}")
#
#     # 3) Проверяем, что TextGrid создался
#     textgrid_path = os.path.join(out_dir, f"{basename}.TextGrid")
#     if not os.path.exists(textgrid_path):
#         print(">>> TextGrid not found in out_dir, alignment possibly failed", flush=True)
#         shutil.rmtree(temp_dir, ignore_errors=True)
#         raise RuntimeError("TextGrid not found. Possibly MFA failed silently.")
#
#     # 4) Парсим TextGrid
#     tg = TextGrid.fromFile(textgrid_path)
#     words_tier = tg.getFirst("words")
#
#     result_data = []
#     for interval in words_tier:
#         word = interval.mark.strip()
#         start = float(interval.minTime)
#         end = float(interval.maxTime)
#         if not word:
#             continue
#         result_data.append({
#             "word": word,
#             "start_time": start,
#             "end_time": end
#         })
#
#     shutil.rmtree(temp_dir, ignore_errors=True)
#     return result_data
#
