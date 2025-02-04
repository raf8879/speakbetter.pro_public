"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface MisWordGlobal {
id: number;
word: string;
accuracy: number;
created_at: string;
}

export default function PracticeWordsPage() {
const router = useRouter();
const { user, isLoading } = useAuth();

const [loading, setLoading] = useState(true);
const [words, setWords] = useState<MisWordGlobal[]>([]);
const [error, setError] = useState("");


type PollTimer = ReturnType<typeof setInterval>;
const pollRef = useRef<PollTimer | null>(null);
const fetchMisWords = () => {
  api
    .get<MisWordGlobal[]>("/api/pronunciation/miswords/")
    .then((res) => {
      setWords(res.data || []);
      setError("");
    })
    .catch((err) => {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    })
    .finally(() => {
      setLoading(false);
    });
};

useEffect(() => {
  if (isLoading) return;
  if (!user) {
    router.push("/login");
    return;
  }

  fetchMisWords();

  // 4) Запускаем polling каждые 30 сек
  pollRef.current = setInterval(() => {
    fetchMisWords();
  }, 30000);

  // 5) По размонтированию страницы — остановить интервал
  return () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
}, [isLoading, user, router]);

if (loading) {
  return (
    <div className="p-4">
      <p>Loading mispronounced words...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4">
      <p className="text-red-600">{error}</p>
    </div>
  );
}

// Если список пуст → сообщение «No words found»
if (words.length === 0) {
  return (
    <main className="p-4 flex flex-col min-h-screen">
      <section
        className="
          mb-6 text-center
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
          py-6 px-2 rounded
        "
      >
        <h2
          className="
            text-2xl font-semibold
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
          "
        >
          Practice Words
        </h2>
      </section>

      <section className="max-w-3xl mx-auto text-center">
        <p className="text-gray-700">
          No mispronounced words found. Great job!
        </p>
      </section>
    </main>
  );
}

// Иначе отображаем «карточки» слов
return (
  <main className="p-4 flex flex-col min-h-screen">
    {/* Заголовок-баннер */}
    <section
      className="
        mb-6 text-center
        bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
        py-6 px-2 rounded
      "
    >
      <h2
        className="
          text-2xl font-semibold
          bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
          text-transparent bg-clip-text
        "
      >
        Practice Words
      </h2>
      <p className="text-gray-700 mt-2">
        These words were identified as mispronounced.
        Click any to train it individually.
      </p>
    </section>

    {/* Сетка «карточек» */}
    <section
      className="
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        gap-4 max-w-5xl mx-auto
      "
    >
      {words.map((w) => (
        <motion.div
          key={w.id}
          className="
            bg-white rounded-lg shadow p-4
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push(`/practice-words/${w.word}`)}
        >
          {/* Название слова как заголовок */}
          <h3
            className="
              text-lg font-semibold mb-1
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            "
          >
            {w.word}
          </h3>

          {/* Accuracy */}
          <p className="text-gray-600 mb-2">
            Accuracy: <strong>{w.accuracy.toFixed(1)}</strong>
          </p>

          {/* Дата (создано) */}
          <p className="text-sm text-gray-500 mt-auto">
            Added: {new Date(w.created_at).toLocaleString()}
          </p>
        </motion.div>
      ))}
    </section>
  </main>
);
}

