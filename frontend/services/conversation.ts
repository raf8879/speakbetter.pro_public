import { api } from "./api";

// Список тем
export async function fetchConversationTopics(): Promise<string[]> {
  const res = await api.get<string[]>("/api/conversation/topics/");
  return res.data;
}

// Начало беседы
interface StartConvResponse {
  conversation_id?: number;
  guest_id?: string;
  message?: string;
}
export async function startConversation(topic: string): Promise<StartConvResponse> {
  const res = await api.post("/api/conversation/start/", { topic });
  return res.data; // { conversation_id, guest_id, message }
}

// Отправка аудио
export interface ConversationResponse {
  transcript: string;
  assistant_text: string;
  assistant_audio_b64: string;
  feedback?: string;
  error?: string;
}
export async function sendConversationAudio(
  convId: number,
  audioFile: File,
  feedback: boolean = true
): Promise<ConversationResponse> {
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("feedback", feedback ? "true" : "false");

  const res = await api.post<ConversationResponse>(`/api/conversation/${convId}/`, formData);
  return res.data; 
}
