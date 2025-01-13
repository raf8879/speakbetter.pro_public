import { api } from "./api";

// 1) Запрос на сброс
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const res = await api.post("/api/auth/password-reset/", { email });
  return res.data; // { message: "...", ...}
}

// 2) Подтверждение сброса
export async function confirmPasswordReset(
  token: string,
  password: string,
  password_confirm: string
): Promise<{ message: string }> {
  const res = await api.post("/api/auth/password-reset/confirm/", {
    token,
    password,
    password_confirm
  });
  return res.data; // { message: "..."}
}
