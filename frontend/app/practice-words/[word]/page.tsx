"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "@/services/api";
import { trainWord } from "@/services/wordTraining";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
const ReactMediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
);

interface MisWordGlobal {
  id: number;
  word: string;
  accuracy: number;
  created_at: string;
}

export default function PracticeSingleWordPage() {
  const router = useRouter();
  const params = useParams();
  const wordStr = params.word as string; // из /practice-words/[word]

  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  const [allWords, setAllWords] = useState<MisWordGlobal[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState(
    "When you're ready, press the microphone and read the word out loud."
  );
  const [isRecording, setIsRecording] = useState(false);

  // Показываем «зеленое» (score≥80) или «красное» (score<80)
  const [lastScore, setLastScore] = useState<number | null>(null); // null → не читал ещё

  // Храним ID таймера (на 5 минут) — если пользователь произнёс слово хорошо (score≥80)
  const removeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) return; // ждём загрузки профиля
    if (!user) {
      // не авторизован → отправим на /login
      router.push("/login");
      return;
    }

    // Загружаем все miswords
    api
      .get<MisWordGlobal[]>("/api/pronunciation/miswords/")
      .then((res) => {
        const words = res.data || [];
        setAllWords(words);

        const idx = words.findIndex((w) => w.word === wordStr);
        if (idx === -1) {
          // слова нет → уходим на список
          router.push("/practice-words");
        } else {
          setCurrentIndex(idx);
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message;
        setErrorMsg(msg);
      });
  }, [isLoading, user, wordStr, router]);

  const currentWordObj = allWords[currentIndex] || null;

  // Перелистнуть назад
  function goPrevWord() {
    if (!allWords.length) return;
    let newIdx = currentIndex - 1;
    if (newIdx < 0) newIdx = allWords.length - 1;
    router.push(`/practice-words/${allWords[newIdx].word}`);
  }
  // Перелистнуть вперёд
  function goNextWord() {
    if (!allWords.length) return;
    let newIdx = currentIndex + 1;
    if (newIdx >= allWords.length) newIdx = 0;
    router.push(`/practice-words/${allWords[newIdx].word}`);
  }

  // Проиграть верное произношение (TTS)
  async function playWordAudio(word: string) {
    setErrorMsg("");
    try {
      const res = await api.get<{ audio_b64: string }>(
        `/api/pronunciation/word-audio/?word=${encodeURIComponent(word)}`
      );
      const audioSrc = `data:audio/wav;base64,${res.data.audio_b64}`;
      const audio = new Audio(audioSrc);
      audio.play();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setErrorMsg(msg);
    }
  }

  // Остановка записи
  async function handleStopRecording(_blobUrl: string, blob: Blob) {
    setErrorMsg("");
    setInfoMsg("Analyzing your speech...");
    setLastScore(null);

    try {
      const file = new File([blob], "train.wav", { type: blob.type });
      const resp = await trainWord(wordStr, file);
      // resp: { message, score?:number }
      if (resp.message) {
        addNotification(resp.message, "success");
      }

      if (typeof resp.score === "number") {
        setLastScore(resp.score);
      }

      // Если score≥80 => запускаем 5-минутный таймер
      if (resp.score && resp.score >= 80) {
        setInfoMsg("Good job! You have 5 more minutes to practice if you want.");
        // Сбрасываем предыдущий таймер
        if (removeTimerRef.current) {
          clearTimeout(removeTimerRef.current);
          removeTimerRef.current = null;
        }
        // Запускаем новый
        removeTimerRef.current = setTimeout(() => {
          removeWord();
        }, 5 * 60 * 1000); // 5 минут
      } else {
        // score<80 => оставляем
        setInfoMsg("Try again if you want a better result");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      if (msg.includes("NoMatch")) {
        setErrorMsg("We couldn't hear you. Please try again.");
        setInfoMsg("Speak clearly into your microphone.");
      } else {
        setErrorMsg(msg);
        setInfoMsg("Error analyzing speech");
      }
    }
  }

  // Удаляем текущее слово из списка
  function removeWord() {
    // если currentWordObj уже отсутствует — выходим
    if (!currentWordObj) return;
    const filtered = allWords.filter((x) => x.word !== wordStr);
    setAllWords(filtered);
    // Если массив пуст — возвращаем на список
    if (!filtered.length) {
      router.push("/practice-words");
    } else {
      // Иначе идём к следующему (или предыдущему)
      goNextWord();
    }
  }

  if (errorMsg && !currentWordObj) {
    return <div className="p-4 text-red-600">{errorMsg}</div>;
  }
  if (!currentWordObj) {
    return <div className="p-4">Loading...</div>;
  }

  // Определяем цвет слова: если lastScore≥80 => text-green, иначе text-red
  let wordColor = "text-red-600";
  if (lastScore !== null && lastScore >= 80) {
    wordColor = "text-green-600";
  }

  return (
    <div
      className="
        relative
        m-4 p-4
        bg-white dark:bg-gray-800
        shadow-lg rounded
        flex flex-col
        items-center justify-center
      "
      style={{
        minHeight: "calc(100vh - 8rem)", // оставляем место под header/side/footer
      }}
    >
      {/* Кнопка «Back to list» вверху слева */}
      <button
        onClick={() => router.push("/practice-words")}
        className="
          absolute top-4 left-4
          px-3 py-1 
          bg-gray-200 dark:bg-gray-700 
          text-gray-700 dark:text-gray-200 
          rounded hover:opacity-80 transition
          flex items-center gap-2
        "
      >
        {/* Иконка Arrow Left */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <span>Back to list</span>
      </button>

      {/* Сообщение-инструкция */}
      <h3 className="absolute top-16 text-sm md:text-base text-gray-500 dark:text-gray-300 text-center">
        {infoMsg}
      </h3>

      {/* Сообщение об ошибке (если есть) */}
      {errorMsg && (
        <div className="absolute top-24 text-red-600 text-sm md:text-base px-2">
          {errorMsg}
        </div>
      )}

      {/* Главное слово (цвет меняется в зависимости от lastScore) */}
      <div className={`text-5xl md:text-6xl font-bold mt-16 mb-8 ${wordColor}`}>
        {currentWordObj.word}
      </div>

      {/* Кнопки внизу (динамик + микрофон) */}
      <div className="absolute bottom-16 flex gap-8 items-center justify-center">
        {/* Кнопка воспроизведения (динамик) */}
        <button
          onClick={() => playWordAudio(currentWordObj.word)}
          className="text-green-600 dark:text-gray-200 hover:text-blue-500"
          title="Play correct pronunciation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5
               a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18
               c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511
               l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845
               0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59
               c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 
               0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 
               0 0 0 8.835-2.535m0 
               0A23.74 23.74 
               0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 
               1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125
               a23.91 23.91 0 0 0 1.014-5.395m0-3.46
               c.495.413.811 1.035.811 1.73 0 
               .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347
               0 0 1 0 3.46"
            />
          </svg>
        </button>

        {/* Микрофон */}
        <ReactMediaRecorder
          audio
          onStop={handleStopRecording}
          render={({ status, startRecording, stopRecording }) => {
            const recording = (status === "recording");
            return (
              <button
                onClick={() => {
                  if (recording) {
                    stopRecording();
                    setIsRecording(false);
                  } else {
                    setErrorMsg("");
                    setInfoMsg("Recording…");
                    startRecording();
                    setIsRecording(true);
                  }
                }}
                className={`
                  flex items-center justify-center
                  w-14 h-14 md:w-16 md:h-16 rounded-full
                  transition 
                  ${
                    recording
                      ? "bg-red-500 text-white animate-pulse" 
                      : "text-green-600 dark:text-gray-200 hover:text-blue-500"
                  }
                `}
                title={recording ? "Stop Recording" : "Start Recording"}
              >
                {recording ? (
                  // Иконка "Stop" (примем квадрат)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-10 h-10"
                  >
                    <path d="M6 4.5h12c.828 0 1.5.672 1.5
                     1.5v12c0 .828-.672 1.5-1.5 1.5H6c-.828
                     0-1.5-.672-1.5-1.5v-12c0-.828.672-1.5
                     1.5-1.5z" />
                  </svg>
                ) : (
                  // Иконка "микрофон"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 1.5a3 3 0 0 1 3 3v6a3
                      3 0 0 1-6 0v-6a3 3 0 0 1 3-3zM19.5
                      10.5v1.125a7.5 7.5 0 0 1-15 
                      0V10.5M12 19.5v3m-2.25 0h4.5"
                    />
                  </svg>
                )}
              </button>
            );
          }}
        />
      </div>

      {/* Стрелки влево/вправо */}
      <button
        onClick={goPrevWord}
        className="
          absolute top-1/2 left-6 
          -translate-y-1/2
          p-3 rounded-full 
          bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
          hover:opacity-80 transition
        "
        title="Previous word"
      >
        {/* Heroicons Arrow Left */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>

      <button
        onClick={goNextWord}
        className="
          absolute top-1/2 right-6 
          -translate-y-1/2
          p-3 rounded-full 
          bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
          hover:opacity-80 transition
        "
        title="Next word"
      >
        {/* Heroicons Arrow Right */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 
             0-7.5 7.5M21 12H3"
          />
        </svg>
      </button>
    </div>
  );
}
