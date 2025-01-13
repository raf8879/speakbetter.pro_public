"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
// yarn add react-confetti
import Confetti from "react-confetti";

interface AchievementData {
  code: string;
  name: string;
  description: string;
  unlocked_at: string;
}

export default function GamificationStatsPage() {
  const { user, isLoading } = useAuth();
  const [xp, setXp] = useState(0);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setErrorMsg("Not logged in");
      setLoading(false);
      return;
    }
    // user is present => загружаем gamification stats
    api
      .get("/api/stats/my")
      .then((res) => {
        setXp(res.data.xp);
        setAchievements(res.data.achievements);
        setLoading(false);
        // если есть достижения => запускаем конфетти
        if (res.data.achievements && res.data.achievements.length > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || err.message);
        setLoading(false);
      });
  }, [user, isLoading]);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading stats...</p>
      </main>
    );
  }
  if (errorMsg) {
    return (
      <main className="p-4 text-red-600">
        {errorMsg}
      </main>
    );
  }

  // === Структура страницы ===
  return (
    <main className="flex flex-col min-h-screen">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={2000}
        />
      )}

      {/* Градиентная «шапка» */}
      <section
        className="
          w-full
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
          text-center p-8
        "
      >
        <h2
          className="
            text-3xl font-semibold
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
            mb-2
          "
        >
          My Stats
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Track your XP and achievements here!
        </p>
      </section>

      {/* Кнопка «Back» */}
      <div className="ml-4 mt-4">
        <button
          onClick={() => router.push("/account")}
          className="
            px-3 py-1
            text-gray-700
            hover:text-blue-600
            transition
          "
        >
          ← Back
        </button>
      </div>

      {/* 1) Секция с большой плиткой XP (по центру) */}
      <section
        className="
          flex flex-col items-center justify-center
          w-full
          px-4
          py-10
        "
      >
        <motion.div
          className="
            bg-white dark:bg-gray-800
            rounded-lg shadow p-8
            flex flex-col items-center justify-center
          "
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3
            className="
              text-xl font-semibold mb-6
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            "
          >
            Your XP
          </h3>
          <div
            className="
              w-52 h-52
              flex items-center justify-center
              rounded-full
              bg-gradient-to-r from-purple-300 to-pink-300
              shadow-inner
              mb-4
            "
          >
            <p
              className="
                text-4xl font-extrabold text-purple-700
                dark:text-purple-300
              "
            >
              {xp}
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-200 text-sm">
            Keep going to earn more XP!
          </p>
        </motion.div>
      </section>

      {/* 2) Сетка ачивок (по центру) */}
      <section
        className="
          max-w-6xl mx-auto
          w-full
          px-4
          pb-10
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
          gap-6
        "
      >
        {achievements.length === 0 && (
          <div className="text-gray-500 col-span-full text-center">
            No achievements yet.
          </div>
        )}

        {achievements.map((a) => (
          <motion.div
            key={a.code}
            className="
              bg-white dark:bg-gray-800
              rounded-lg shadow p-4
              hover:shadow-lg transition
              cursor-pointer
              flex flex-col
            "
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h4
              className="
                text-lg font-semibold
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
                mb-2
              "
            >
              {a.name}
            </h4>
            <p className="text-gray-700 dark:text-gray-200 flex-1">
              {a.description}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Unlocked at: {new Date(a.unlocked_at).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
