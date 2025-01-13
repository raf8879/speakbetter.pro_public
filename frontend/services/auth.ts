import { api } from "./api";

// services/auth.ts
// всё общение через api(axios) + withCredentials

// === Login ===
export async function loginUser(username: string, password: string) {
  // POST /api/token/
  // бэкенд по идее проставляет куки access_token, refresh_token
  const res = await api.post("/api/token/", { username, password });
  // res.data = { detail: "Login successful" }
  return res.data; // "Login successful"
}

// === Logout ===
export async function logoutUser() {
  // POST /api/auth/logout/
  await api.post("/api/auth/logout/");
}

// === me ===
export async function fetchMe() {
  // GET /api/auth/me/
  // если cookie access_token валидна => 200 + {id,username,email}
  // иначе 401
  const res = await api.get("/api/auth/me/");
  return res.data; // {id,username,email}
}

// === register ===
export async function registerUser(username: string, password: string, email: string) {
  // POST /api/auth/register/
  const res = await api.post("/api/auth/register/", { username, password, email });
  return res.data; // {message: "User created..."}
}

// === verifyEmail ===
export async function verifyEmail(token: string) {
  // POST /api/auth/verify-email/
  const res = await api.post("/api/auth/verify-email/", { token });
  return res.data;
}
