"use client";
import React, { useEffect, useState } from "react";
import { fetchAdminStats, AdminStatsData } from "@/services/adminStats";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchAdminStats()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error || err.response?.data?.detail || err.message;
        setErrorMsg(msg);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading admin stats...</p>;
  if (errorMsg) return <p style={{ color: "red", padding: 20 }}>{errorMsg}</p>;
  if (!data) return <p style={{ padding: 20 }}>No data.</p>;


  const modeLabels = Object.keys(data.mode_counts);
  const modeValues = Object.values(data.mode_counts);


  const chartData = {
    labels: modeLabels,
    datasets: [
      {
        label: "Mode usage",
        data: modeValues,
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Mode usage in the last 7 days",
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      <div style={{ marginTop: 10, marginBottom: 20 }}>
        <p>Total users: {data.total_users}</p>
        <p>Active (last day): {data.active_users_daily}</p>
        <p>Active (last week): {data.active_users_weekly}</p>
        <p>Most popular mode: {data.most_popular_mode || "N/A"}</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Если хотите, можно сделать ещё таблицы, графики и т.д. */}
    </div>
  );
}
