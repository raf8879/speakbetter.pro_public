import { api } from "./api";

export async function trainWord(word: string, file: File) {
  const formData = new FormData();
  formData.append("word", word);
  formData.append("audio", file);

  const res = await api.post("/api/pronunciation/word-training/", formData);
  return res.data; // { message, score }
}
