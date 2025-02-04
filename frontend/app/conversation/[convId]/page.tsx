"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  getConversationHistory,
  sendConversationAudio,
} from "@/services/conversationApi";

// Декодирование base64 → audio/wav
function createAudioUrlFromBase64(base64Data: string): string {
  const byteChars = atob(base64Data);
  const arr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    arr[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([arr], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

// Динамический импорт MediaRecorder
const ReactMediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
);

export default function VoiceConversationPage() {
  const router = useRouter();
  const params = useParams();
  const convId = params.convId as string;

  // Массив сообщений
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; audioUrl?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [assistantTyping, setAssistantTyping] = useState(false);


  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1) Подгружаем историю
  useEffect(() => {
    setLoading(true);
    getConversationHistory(convId)
      .then((arr) => {
        setMessages(arr);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err?.message || String(err));
        setLoading(false);
      });
  }, [convId]);

  // 2) Остановка записи → отправка
  async function handleStopRecording(_blobUrl: string, blob: Blob) {
    setErrorMsg("");
    setAssistantTyping(true);
    try {
      const file = new File([blob], "voice.wav", { type: blob.type });
      const resp = await sendConversationAudio(convId, file);
      setAssistantTyping(false);

      // user-сообщение (текст)
      setMessages((prev) => [
        ...prev,
        { role: "user", content: resp.transcript },
      ]);

      // assistant
      const assistantMsg = {
        role: "assistant",
        content: resp.assistant_text,
        audioUrl: undefined as string | undefined,
      };
      if (resp.assistant_audio_b64) {
        const audioUrl = createAudioUrlFromBase64(resp.assistant_audio_b64);
        assistantMsg.audioUrl = audioUrl;
        if (!audioRef.current) {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          setPlayingUrl(audioUrl);

          audio.play().catch(() => {
            console.log("Autoplay blocked; user must tap play button");
          });

          // Когда аудио закончится само — сбрасываем
          audio.addEventListener("ended", () => {
            setPlayingUrl(null);
            audioRef.current = null;
          });
        }
      }
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setAssistantTyping(false);
      setErrorMsg(err?.message || String(err));
    }
  }

  // ============== Play / Pause кнопка ================
  function handleAudioClick(url: string) {
    // Если это же аудио уже играет => нажимаем «pause»
    if (playingUrl === url && audioRef.current) {
      // Если играет => пауза
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        // Можно обнулить, если хотим при повторном клике воспроизводить с нуля
        // audioRef.current.currentTime = 0;
        // Либо просто пауза, а при повторном нажатии — play()
        setPlayingUrl(null);
        audioRef.current = null;
      }
      return;
    }

    // Если играло другое аудио, останавливаем его
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingUrl(null);
    }

    // Создаём новый объект
    const newAudio = new Audio(url);
    audioRef.current = newAudio;
    setPlayingUrl(url);

    newAudio.play().catch((err) => {
      console.log("Autoplay blocked or error:", err);
    });

    // Когда аудио закончится само => сбрасываем
    newAudio.addEventListener("ended", () => {
      setPlayingUrl(null);
      audioRef.current = null;
    });
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading conversation...</p>
      </div>
    );
  }
  if (errorMsg) {
    return (
      <div className="p-4 text-red-600">
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-r from-purple-200 via-pink-150 to-blue-50">
      {/* ШАПКА */}
      <div
        className="
          flex items-center justify-between
          px-4 py-3
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
        "
      >
        {/* Кнопка Back */}
        <button
          onClick={() => router.push("/conversation")}
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
          Voice Conversation
        </h2>
        <div className="w-6" />
      </div>

      {/* Если есть глобальная ошибка */}
      {errorMsg && (
        <div className="bg-red-200 text-red-700 text-sm p-2">{errorMsg}</div>
      )}

      {/* Основная область (прокручиваемая) */}
      <div className="flex-1 overflow-y-auto p-3 pb-28">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            const bubbleAlign = isUser ? "items-end" : "items-start";
            const bubbleColor = isUser
              ? "bg-blue-500 text-white self-end"
              : "bg-white text-gray-800 self-start";

            return (
              <div key={idx} className={`flex flex-col ${bubbleAlign}`}>
                <div className={`px-4 py-2 rounded-lg ${bubbleColor} max-w-[75%]`}>
                  <span>{msg.content}</span>

                  {msg.audioUrl && (
                    <button
                      onClick={() => handleAudioClick(msg.audioUrl!)}
                      className="ml-2 inline-flex opacity-80 hover:opacity-100"
                      title={playingUrl === msg.audioUrl ? "Pause audio" : "Play audio"}
                    >
                      {playingUrl === msg.audioUrl ? (
                        /* Иконка «Pause» */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none" viewBox="0 0 24 24"
                          strokeWidth={1.5} stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round" strokeLinejoin="round"
                            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                          />
                        </svg>
                      ) : (
                        /* Иконка «Play» */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none" viewBox="0 0 24 24"
                          strokeWidth={1.5} stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round" strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986
                              l11.54 6.347a1.125 1.125 0 0 1 0 1.972
                              l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986
                              V5.653Z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {assistantTyping && (
            <div className="flex items-start">
              <div className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 max-w-[75%]">
                <span className="text-gray-600 dark:text-gray-100 animate-pulse">
                  Assistant is thinking...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Панель снизу (микрофон). */}
      <div
        className="
          sticky bottom-0 z-10
          px-3 py-3
          bg-gradient-to-r from-purple-200 via-pink-150 to-blue-50
          flex justify-center
        "
      >
        <ReactMediaRecorder
          audio
          onStop={handleStopRecording}
          render={({ status, startRecording, stopRecording }) => {
            const isRecording = status === "recording";
            return (
              <button
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    setErrorMsg("");
                    startRecording();
                  }
                }}
                title={isRecording ? "Stop Recording" : "Start Recording"}
                className={`
                  w-12 h-12
                  ${
                    isRecording
                      ? "text-red-500 animate-pulse"
                      : "text-green-600 dark:text-gray-200 hover:text-blue-500"
                  }
                `}
              >
                {isRecording ? (
                  // Иконка STOP
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-full h-full"
                  >
                    <path d="M6 4.5h12c.828 0 1.5.672 
                      1.5 1.5v12c0 .828-.672 1.5-1.5 
                      1.5H6c-.828 0-1.5-.672-1.5-1.5
                      v-12c0-.828.672-1.5 1.5-1.5z" 
                    />
                  </svg>
                ) : (
                  // Иконка «микрофон»
                  <svg
                    xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"
                    className="w-full h-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 1.5a3 3 0 0 1 3 3v6
                        a3 3 0 0 1-6 0v-6
                        a3 3 0 0 1 3-3z
                        M19.5 10.5v1.125
                        a7.5 7.5 0 0 1-15 0V10.5
                        M12 19.5v3
                        M9.75 22.5h4.5"
                    />
                  </svg>
                )}
              </button>
            );
          }}
        />
      </div>
    </div>
  );
}
