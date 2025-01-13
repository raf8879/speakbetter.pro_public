"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { api } from "@/services/api";

// Динамический импорт ReactMediaRecorder, чтобы избежать проблем с SSR
const ReactMediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
);

import ModalInsideCard from "@/components/ModalInsideCard";
import CircleGauge from "@/components/CircleGauge";

/** HoverTooltip: простой тултип при наведении. */


function HoverTooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="relative flex items-center group"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {children}
      {showTip && (
        <div
          className="
            absolute bottom-full mb-2
            px-3 py-2
            bg-blue-500 text-white text-sm rounded-lg shadow-lg
            whitespace-pre-line opacity-0 scale-95
            transition-all duration-300 ease-in-out
            group-hover:opacity-100 group-hover:scale-100
          "
          style={{ left: "42%", transform: "translateX(-50%)" }}
        >
          {text}
          <div
/*             className="
              absolute top-full left-1/2 transform -translate-x-1/2
              w-3 h-3 bg-gray-800 rotate-45
            " */
          ></div>
        </div>
      )}
    </div>
  );
}
interface WordDetail {
  word: string;
  score: number;
  error_type: "None" | "Mispronunciation" | "Omission";
}

interface PronunciationResponse {
  score: number;
  accuracy_score: number;
  fluency_score: number;
  completeness_score: number;
  words: WordDetail[];
  xp_gained?: number;
  achievements_unlocked?: Array<{ code: string; name: string }>;
  new_xp?: number;
}

export default function PronunciationExercisePage() {
  const router = useRouter();
  const { exerciseId } = useParams() as { exerciseId: string };
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  // Текст упражнения
  const [exerciseText, setExerciseText] = useState("");
  // Разные сообщения
  const [infoMsg, setInfoMsg] = useState("When you're ready, press the mic button.");
  const [errorMsg, setErrorMsg] = useState(""); // для неожиданных ошибок
  const [isRecording, setIsRecording] = useState(false);

  // Метрики
  const [score, setScore] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [fluency, setFluency] = useState<number>(0);
  const [completeness, setCompleteness] = useState<number>(0);
  const [wordsDetail, setWordsDetail] = useState<WordDetail[]>([]);

  // Открыто ли окно с деталями
  const [modalOpen, setModalOpen] = useState(false);

  // ========= 1) Загружаем упражнение =============
  useEffect(() => {
    if (isLoading) return; // Ждём, пока AuthContext загрузится
    if (!user) {
      // Не авторизован → отправляем на /login
      router.push("/login");
      return;
    }

    // Иначе грузим текст
    api
      .get(`/api/pronunciation/exercises/${exerciseId}/`)
      .then((res) => {
        let rawText = res.data.text || "";
        // Уберём возможные лишние переносы строк, неразрывные пробелы и т.д.
        let cleaned = rawText
          .replace(/\r?\n/g, " ")   // \n → пробел
          .replace(/\u00A0/g, " ")  // неразрывные пробелы → обычные
          .replace(/\s{2,}/g, " ")  // двойные пробелы → один
          .trim();
        setExerciseText(cleaned);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || err.message);
      });
  }, [isLoading, user, exerciseId, router]);

  // ======== 2) Остановка записи => анализ =============
  async function handleStopRecording(_blobUrl: string, blob: Blob) {
    setInfoMsg("Analyzing your speech...");
    setScore(0);
    setWordsDetail([]);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("audio", blob, "recorded.wav");
      const resp = await api.post<PronunciationResponse>(
        `/api/pronunciation/${exerciseId}/attempt/`,
        fd
      );
      const data = resp.data;

      // XP/achievements → уведомления
      if (data.xp_gained && data.xp_gained > 0) {
        addNotification(`You gained +${data.xp_gained} XP!`, "success");
      }
      if (data.achievements_unlocked?.length) {
        data.achievements_unlocked.forEach((ach) => {
          addNotification(`Achievement Unlocked: ${ach.name}`, "success");
        });
      }

      setScore(data.score || 0);
      setAccuracy(data.accuracy_score || 0);
      setFluency(data.fluency_score || 0);
      setCompleteness(data.completeness_score || 0);
      setWordsDetail(data.words || []);

      setInfoMsg("Done!");
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      if (msg.includes("NoMatch")) {
        // "нет речи" → глобальное уведомление
        addNotification("No speech detected. Please speak clearly!", "error");
        setInfoMsg("Try again");
      } else {
        // прочие ошибки
        setErrorMsg(msg);
      }
    }
  }

  // ======== 3) Клик по слову => TTS ========
  async function playSingleWordAudio(word: string) {
    try {
      const res = await api.get<{ audio_b64: string }>(
        `/api/pronunciation/word-audio/?word=${encodeURIComponent(word)}`
      );
      const audioData = `data:audio/wav;base64,${res.data.audio_b64}`;
      new Audio(audioData).play();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setErrorMsg(msg);
    }
  }

  // ======== Подсветка слов + клики ========
  function renderColoredText() {
    if (!exerciseText) return null;
  
    // Сохраняем пробелы при split
    const tokens = exerciseText.split(/(\s+)/);
  
    return tokens.map((raw, idx) => {
      if (/^\s+$/.test(raw)) {
        // Это пробел или несколько пробелов
        return <span key={`space-${idx}`}>{raw}</span>;
      }
  
      // Это «слово» (или слово+пунктуация)
      const clean = raw.replace(/[.,!?;:()]/g, "").toLowerCase();
      const found = wordsDetail.find((w) => w.word.toLowerCase() === clean);
  
      let colorClass = "text-gray-800 dark:text-gray-100";
      if (found) {
        if (found.error_type === "Mispronunciation") {
          colorClass = "text-red-500 font-bold";
        } else if (found.error_type === "Omission") {
          colorClass = "text-orange-500 font-bold";
        } else {
          colorClass = "text-green-500 font-bold";
        }
      }
  
      return (
        <span
          key={`word-${idx}`}
          className={`${colorClass} cursor-pointer hover:text-purple-500`}
          onClick={() => playSingleWordAudio(clean)}
        >
          {raw}
        </span>
      );
    });
  }
  

  // ======== 4) Модальное окно (accuracy/fluency/completeness + miswords) ========
  function renderModal() {
    // Выбираем уникальные «неправильные» слова
    const misSet = new Set<string>();
    wordsDetail.forEach((w) => {
      if (w.error_type !== "None") {
        misSet.add(w.word);
      }
    });
    let arr = Array.from(misSet);
    let hasExtra = false;
    if (arr.length > 5) {
      arr = arr.slice(0, 5);
      hasExtra = true;
    }

    return (
<ModalInsideCard open={modalOpen} onClose={() => setModalOpen(false)}>
  <div className="flex flex-col items-center space-y-6 p-6">
    {/* Три мини-диаграммы с описаниями */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full justify-center">
      <HoverTooltip text="Accuracy: How correct each sound is.">
        <div className="flex flex-col items-center">
          <CircleGauge value={accuracy} size={80} strokeWidth={6} label="Accuracy" />
          <p className="mt-2 text-sm text-gray-600">Accuracy</p>
        </div>
      </HoverTooltip>
      <HoverTooltip text="Fluency: How smoothly you speak.">
        <div className="flex flex-col items-center">
          <CircleGauge value={fluency} size={80} strokeWidth={6} label="Fluency" />
          <p className="mt-2 text-sm text-gray-600">Fluency</p>
        </div>
      </HoverTooltip>
      <HoverTooltip text="Completeness: How much of the text you spoke.">
        <div className="flex flex-col items-center">
          <CircleGauge value={completeness} size={80} strokeWidth={6} label="Complete" />
          <p className="mt-2 text-sm text-gray-600">Completeness</p>
        </div>
      </HoverTooltip>
    </div>

    {/* Список miswords (если есть) */}
    {arr.length > 0 && (
      <div className="border border-gray-300 rounded-lg p-4 w-full max-w-md text-sm bg-gray-50 shadow-lg">
        <h4 className="font-semibold mb-2 text-lg text-gray-800 text-center">
          Mispronounced Words
        </h4>
        <div className="space-y-1">
          {arr.map((w, i) => (
            <div
              key={i}
              className="bg-gray-100 py-1 px-3 rounded-md text-gray-700 hover:bg-gray-200 transition"
            >
              {w}
            </div>
          ))}
          {hasExtra && <div className="text-gray-500 text-center mt-2">…</div>}
        </div>
      </div>
    )}
  </div>

  {/* Анимации и стили */}
  <style jsx>{`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-in {
      animation: fade-in 0.5s ease-in-out;
    }
  `}</style>
</ModalInsideCard>

    );
  }

  // Если при загрузке нет текста и вылезла ошибка
  if (errorMsg && !exerciseText) {
    return <div className="p-4 text-red-600">{errorMsg}</div>;
  }

  // ======== Основной рендер ========
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
      style={{ minHeight: "calc(100vh - 8rem)" }}
    >
      {/* Кнопка "назад" */}
      <button
        onClick={() => router.back()}
        className="
          absolute top-4 left-4
          text-gray-600 dark:text-gray-200
          hover:text-blue-500
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 
               0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>

      {/* Инструкция */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-300">
        {infoMsg}
      </div>

      {/* Общий Score (большая круговая диаграмма) */}
      <div className="mt-2">
        <CircleGauge value={score} size={120} strokeWidth={10} label="Score" />
      </div>

      {/* Кнопка: смотреть детали (arrow-down) */}
      <button
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100 mt-2"
        onClick={() => setModalOpen(true)}
        title="View details"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19.5 8.25 12 15.75l-7.5-7.5"
          />
        </svg>
      </button>

      {/* Текст упражнения */}
      <div className="flex-1 flex items-center justify-center w-full mt-4 px-4">
        <div
          className="
            max-w-3xl
            mx-auto
            text-3xl
            leading-relaxed
            text-left
            whitespace-normal
            break-normal
          "
        >
          {renderColoredText()}
        </div>
      </div>

      {/* Если есть «непредвиденные» ошибки */}
      {errorMsg && (
        <p className="text-red-600 text-sm absolute bottom-20">
          {errorMsg}
        </p>
      )}

      {/* Кнопка (микрофон) */}
      <ReactMediaRecorder
        audio
        onStop={handleStopRecording}
        render={({ status, startRecording, stopRecording }) => {
          const recording = status === "recording";
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
              style={{ marginBottom: "1rem" }}
              title={recording ? "Stop Recording" : "Start Recording"}
            >
              {recording ? (
                // Иконка STOP (квадрат)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-12 h-12"
                >
                  <path d="M5.25 5.25a.75.75 0 0 1 
                    .75.75v12a.75.75 
                    0 1 1-1.5 0v-12a.75.75 
                    0 0 1 .75-.75zm14.25.75a.75.75
                    0 0 0-1.5 0v12a.75.75 
                    0 1 0 1.5 0v-12z" />
                </svg>
              ) : (
                // Иконка MIC
                <svg
                  xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 1.5a3 3 0 0 1 
                       3 3v6a3 3 0 0 1-6 
                       0v-6a3 3 0 0 1 
                       3-3z
                       M19.5 10.5v1.125a7.5 7.5 
                       0 0 1-15 0V10.5
                       M12 19.5v3
                       M9.75 22.5h4.5"
                  />
                </svg>
              )}
            </button>
          );
        }}
      />

      {/* Модалка (детали) */}
      {renderModal()}
    </div>
  );
}
