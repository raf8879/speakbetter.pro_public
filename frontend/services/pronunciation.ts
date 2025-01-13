

import { api } from "@/services/api";

export async function sendPronunciationAudio(
  exerciseId: number,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("audio", file);

  // Если в axios вы уже прописали withCredentials=true, 
  // никаких дополнительных заголовков не нужно (если у вас куки).
  // Если же у вас всё-таки Bearer-токен, можно добавить:
  //   headers: { Authorization: `Bearer ${token}` }
  const res = await api.post(`/api/pronunciation/${exerciseId}/attempt/`, formData);

  return res.data; // предполагаем, что бэкенд возвращает JSON
}


export async function getPronunciationStats(): Promise<{ avg_score: number; exercises_read: number }> {
  // просто вызываем GET
  const res = await api.get("/api/pronunciation/stats/");
  // res.data = { avg_score, exercises_read }
  return res.data;
}
