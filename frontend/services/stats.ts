import { api } from "./api";

export interface UserStatsData {
  pronunciation: {
    avg_score: number;
    exercises_read: number;
  };
  exercises: {
    total_ex: number;
    avg_score: number;
  };
}

// Получаем пользовательскую статистику
export async function fetchUserStats(): Promise<UserStatsData> {
  const res = await api.get<UserStatsData>("/api/stats/user/");
  return res.data;
}