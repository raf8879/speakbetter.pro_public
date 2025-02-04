"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function StatsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const access = localStorage.getItem("accessToken");
    if (!access) {
      router.push("/login");
      return;
    }

    api.get("/api/pronunciation/stats/")
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        const msg = err.response?.data?.error || err.message;
        setError(msg);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!stats) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>My Stats</h2>
      <p>Average Score: {stats.avg_score}</p>
      <p>Exercises read: {stats.exercises_read}</p>
    </div>
  );
}
