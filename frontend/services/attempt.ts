// services/attempt.ts
/* 
export async function sendPronunciationAudio(
    exerciseId: number,
    file: File
  ): Promise<{score:number; recognized_text:string; words:any[]}> {
    const formData = new FormData();
    formData.append("audio", file);
  
    const url = `http://127.0.0.1:8000/api/pronunciation/${exerciseId}/attempt/`;
  
    const res = await fetch(url, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(()=>({}));
      throw new Error(errData.error || "Attempt error");
    }
    return res.json();
  }
   */

/*   export async function sendPronunciationAudio(
    exerciseId: number,
    file: File
  ): Promise<{ score:number; recognized_text:string; words:any[] }> {
    const formData = new FormData();
    formData.append("audio", file);
  
    const res = await fetch(`http://127.0.0.1:8000/api/pronunciation/${exerciseId}/attempt/`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(()=>({}));
      throw new Error(errData.error || "Request failed");
    }
    return res.json();
  }
   */


  // services/attempt.ts
// services/attempt.ts
/* import { api } from "./api";

export async function sendPronunciationAudio(exId: number, file: File) {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await api.post(`/api/pronunciation/${exId}/attempt/`, formData);
  return res.data; // { score, recognized_text, ... }
} */
