"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchConversationTopics, startConversation } from "@/services/conversation";
import { motion } from "framer-motion";

export default function ConversationTopicsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return; // пока грузится user
    if (!user) {
      // не авторизован → на /register
      router.push("/register");
      return;
    }

    // загружаем список тем
    fetchConversationTopics()
      .then((data) => {
        setTopics(data);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message;
        setError(msg);
        setLoading(false);
      });
  }, [isLoading, user, router]);

  async function handleTopicClick(topic: string) {
    try {
      const resp = await startConversation(topic);
      // если user.is_authenticated => resp.conversation_id
      if (resp.conversation_id) {
        router.push(`/conversation/${resp.conversation_id}`);
      } else {
        // гостевой режим
        alert("Guest conversation started. (Handle guest logic if needed.)");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
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
      {/* Заголовок / Описание */}
      <section className="
        w-full
        bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
        text-center p-8
      ">
        <h2 className="
          text-3xl font-semibold
          bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
          text-transparent bg-clip-text
          mb-2
        ">
          Conversation Scenarios
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Choose a scenario to practice speaking with our AI tutor. 
          Perfect for real-life interactions in Business, Travel, Medical contexts, and more!
        </p>
      </section>

      {/* Карточки с темами */}
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
            <h3 className="
              text-xl font-semibold mb-2
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            ">
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </h3>

            {/* Короткое описание — можно «хардкодить» под каждую тему */}
            <p className="text-gray-700 flex-1">
              {topic === "business" && "Sharpen your formal communication for negotiations, meetings, and business deals."}
              {topic === "travel" && "Learn essential phrases for airports, hotels, directions, and more."}
              {topic === "doctor" && "Simulate conversations with a physician about your health concerns."}
              {topic === "interview" && "Prepare for job interviews with typical Q&A sessions."}
              {!["business", "travel", "doctor", "interview"].includes(topic) &&
                "Practice real-life dialogues in this scenario!"
              }
            </p>

            <div className="mt-4">
            </div>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
