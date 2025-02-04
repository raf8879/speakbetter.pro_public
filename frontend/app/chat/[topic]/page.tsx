"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";

interface ChatMessage {
  role: string; //
  content: string;
}

export default function ChatTopicPage() {
  const params = useParams();
  const router = useRouter();
  const topic = params.topic as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  // Загрузка истории чата
  useEffect(() => {
    api
      .get(`/api/chat/${topic}/`)
      .then((res) => {
        const allMsgs: ChatMessage[] = res.data.messages || [];
        // Убираем system-сообщения, если не нужно отображать
        const userVisible = allMsgs.filter((m) => m.role !== "system");
        setMessages(userVisible);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message;
        setErrorMsg(msg);
      });
  }, [topic]);

  // Отправка сообщения
  async function handleSend() {
    if (!inputVal.trim()) return;
    setErrorMsg("");

    // Добавляем user-сообщение в локальный стейт
    const userMsg: ChatMessage = { role: "user", content: inputVal.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    try {
      setBotTyping(true);

      // Запрос к бэкенду
      const res = await api.post(`/api/chat/${topic}/`, { message: userMsg.content });
      const replyText = res.data.reply || "(no reply)";

      setBotTyping(false);

      // Добавляем ассистента
      const botMsg: ChatMessage = { role: "assistant", content: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setBotTyping(false);
      const msg = err.response?.data?.error || err.message;
      setErrorMsg(msg);
    }
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden m-0 p-0">
      {/* Шапка чата */}
      <header
        className="
          flex items-center justify-between
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
          p-3
        "
      >
        <button
          onClick={() => router.push("/chat")}
          className="text-gray-700 font-semibold hover:text-gray-900 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            className="w-6 h-6 mr-1"
          >
            <path
              strokeLinecap="round" strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 
                 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>

        <h2
          className="
            text-lg font-semibold
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
          "
        >
          Chat: {topic}
        </h2>

        <div className="w-6" />
      </header>

      {errorMsg && (
        <div className="bg-red-200 text-red-700 text-sm p-2">{errorMsg}</div>
      )}

      {/* Основная зона чата */}
      <div className="flex-1 relative bg-white dark:bg-gray-800">
        {/* Контейнер для сообщений */}
        <div
          className="
            absolute inset-0
            overflow-y-auto
            flex flex-col-reverse
            p-3
            bg-gradient-to-r from-purple-200 via-pink-150 to-blue-50
            pb-20  /* <-- Тут главный момент: добавили нижний padding! */
          "
        >
          {messages.slice().reverse().map((msg, idx) => {
            const isUser = msg.role === "user";
            const bubbleClass = isUser
              ? "bg-blue-500 text-white self-end"
              : "bg-white text-gray-800 self-start";

            return (
              <div key={idx} className="mb-2 flex flex-col">
                <div className={`rounded-lg px-3 py-2 max-w-xs md:max-w-md ${bubbleClass}`}>
                  {msg.content}
                </div>
              </div>
            );
          })}


          {botTyping && (
            <div className="mb-2 flex flex-col self-start">
              <div
                className="
                  rounded-lg px-3 py-2 max-w-xs
                  bg-gray-200 dark:bg-gray-700
                  text-gray-800 dark:text-gray-100
                "
              >
                <span className="animate-pulse">Bot is typing...</span>
              </div>
            </div>
          )}
        </div>

        <div
          className="
            absolute bottom-0 w-full
            bg-gray-200 dark:bg-gray-700
            flex items-center
          
          "
        >
          <input
            className="
              flex-1 px-3 py-2 text-sm
              focus:outline-none focus:ring-1 focus:ring-blue-400
              text-gray-800 dark:text-gray-100
              bg-white dark:bg-gray-600
              rounded-l
            "
            placeholder="Type your message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            onClick={handleSend}
            className="
              bg-gradient-to-r from-purple-400 via-pink-350 to-blue-500
              text-white px-4 py-2 text-sm
              flex items-center
              rounded-r
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              className="w-5 h-5 mr-1 rotate-100"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />

            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
