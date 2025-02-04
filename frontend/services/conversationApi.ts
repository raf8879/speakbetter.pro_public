import { api } from "./api";

// 1) GET /api/conversation/topics/
export async function getConversationTopics(): Promise<string[]> {
  const res = await api.get<string[]>("/api/conversation/topics/");
  return res.data;
}

// 2) POST /api/conversation/start/  {topic}
export async function startConversation(topic: string): Promise<{conversation_id:number,created:boolean,message:string}> {
  const res = await api.post("/api/conversation/start/", { topic });
  return res.data; // { conversation_id, created, message }
}

// 3) GET /api/conversation/<convId>/history/
export async function getConversationHistory(convId: string|number) {
  const res = await api.get(`/api/conversation/${convId}/history/`);
  // [{role,content,created_at}, ...]
  return res.data;
}

// 4) POST /api/conversation/<convId>/
export async function sendConversationAudio(convId: string|number, file: File) {
  const formData = new FormData();
  formData.append("audio", file);
  const res = await api.post(`/api/conversation/${convId}/`, formData);
  return res.data;
}
