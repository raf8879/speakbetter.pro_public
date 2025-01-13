// services/authVerify.ts
import { api } from "./api";

export async function verifyEmail(userId: string, code: string) {
  const res = await api.post("/api/auth/verify/", {
    user_id: userId,
    code: code
  });
  return res.data;
}
