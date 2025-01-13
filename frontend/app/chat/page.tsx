"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

/**
 * Страница: список "chat topics" в виде карточек с дизайном
 * — Градиентный баннер, адаптивная сетка.
 * — При клике на карточку → start chat, далее router.push("/chat/<topic>").
 */
export default function ChatTopicsPage() {
  const router = useRouter();

  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Запрос на /api/chat/topics/:
    api
      .get<string[]>("/api/chat/topics/")
      .then((res) => {
        setTopics(res.data);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message;
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  // Клик по карточке => startChat => /chat/<topic>
  function handleTopicClick(topic: string) {
    api
      .post("/api/chat/start/", { topic })
      .then(() => {
        router.push(`/chat/${topic}`);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      });
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading topics...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Градиентный «баннер» */}
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
          Chat Topics
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Choose a chat scenario to practice writing in various tenses 
          (past, present, future), or any other topics you set up!
        </p>
      </section>



      {/* Сетка карточек */}
      <section className="
        max-w-6xl mx-auto
        px-4 py-10
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        gap-6
      ">
        {topics.map((topic) => (
          <motion.div
            key={topic}
            className="
              bg-white rounded-lg shadow p-6
              flex flex-col
              hover:shadow-lg transition-shadow
              cursor-pointer
            "
            whileHover={{ scale: 1.03 }}
            onClick={() => handleTopicClick(topic)}
          >
            <h3
              className="
                text-xl font-semibold mb-2
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              {/* Например, «past» → «Past» */}
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </h3>

            {/* Пример условных описаний тем */}
            <p className="text-gray-700 flex-1">
              {topic === "past" && "Practice writing in past tense. Get immediate grammar feedback!"}
              {topic === "present" && "Focus on present tense forms, learn common expressions."}
              {topic === "future" && "Plan ahead! Talk about future events with correct forms."}
              {/* Дополнительные темы */}
              {!["past", "present", "future"].includes(topic) &&
                "A custom chat scenario to practice writing skills!"
              }
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
