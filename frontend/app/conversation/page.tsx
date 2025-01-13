// app/conversation/page.tsx
/* "use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchConversationTopics, startConversation } from "@/services/conversation";

export default function ConversationTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    fetchConversationTopics()
      .then((data)=>{
        setTopics(data);
        setLoading(false);
      })
      .catch((err)=>{
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
  },[]);

  const handleTopicClick = async (topic: string) => {
    try {
      const resp = await startConversation(topic);
      // Если user.is_authenticated => resp.conversation_id
      if (resp.conversation_id) {
        router.push(`/conversation/${resp.conversation_id}`);
      } else {
        // Гость => resp.guest_id
        // Можно хранить guest_id в cookies/localStorage
        alert("Guest conversation started. But in our example we go to a 'guest' page or do something else");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <p>Loading topics...</p>;
  if (error)   return <p style={{ color:"red"}}>{error}</p>;

  return (
    <div style={{ padding:20 }}>
      <button onClick={() => router.push("/.")} style={{ marginBottom:10 }}>
        ←
      </button>
      <h2>Conversation Topics</h2>
      <ul style={{ marginTop:10 }}>
        {topics.map((t)=>(
          <li 
            key={t} 
            style={{ cursor:"pointer", textDecoration:"underline", marginBottom:5 }}
            onClick={()=>handleTopicClick(t)}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
} */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchConversationTopics, startConversation } from "@/services/conversation";
import { motion } from "framer-motion";

/**
 * Аналог главной страницы:
 * - Отображаем список "topics" в виде карточек.
 * - При клике на карточку → startConversation(topic).
 */
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
              {/* Может быть кнопка, но т.к. вся карточка кликабельная, оставим так */}
{/*               <span className="
                inline-block px-4 py-2
                text-white
                rounded
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-sm
              ">
                Start
              </span> */}
            </div>
          </motion.div>
        ))}
      </section>
    </main>
  );
}




/* "use client";
import Link from "next/link";
import React from "react";

export default function ConversationIndexPage() {
  return (
    <div style={{ padding:20 }}>
      <h2>Conversation Mode</h2>
      <p>Select a topic to start a conversation:</p>
      <Link href="/conversation/topics" style={{ textDecoration:"underline" }}>
        Topics
      </Link>
    </div>
  );
} */
