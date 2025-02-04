import { api } from "./api";

// GET /api/auth/me/
export async function getMyProfile() {
  const res = await api.get("/api/auth/me/");
  return res.data;
}

// PATCH /api/auth/me/
export async function updateMyProfile(payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
}) {
  const res = await api.patch("/api/auth/me/", payload);
  return res.data;
}
export async function deleteAccount(password: string) {
  // Отправим DELETE запрос на /api/auth/delete-account/
  // Обратите внимание, что у нас withCredentials: true => куки приложатся автоматически.
  const res = await api.delete("/api/auth/delete-account/", {
    data: { password } // payload. В DELETE axios позволяет передавать data в опции { data: {...} }.
  });
  return res.data; 
}