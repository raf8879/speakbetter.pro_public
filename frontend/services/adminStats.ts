import { api } from "./api";

export interface AdminStatsData {
  total_users: number;
  active_users_daily: number;
  active_users_weekly: number;
  mode_counts: Record<string, number>;
  most_popular_mode: string | null;
}

export async function fetchAdminStats(): Promise<AdminStatsData> {
  const res = await api.get<AdminStatsData>("/api/stats/rafa/");
  return res.data;
}
