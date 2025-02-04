"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchExerciseById,
  submitExerciseAnswers,
  Exercise,
  SubmitResult,
} from "@/services/exercises";
import { useNotifications } from "@/context/NotificationsContext";

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const level = params.level as string;
  const exerciseId = parseInt(params.exerciseId as string, 10);

  // Вытаскиваем addNotification из контекста
  const { addNotification } = useNotifications();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchExerciseById(exerciseId)
      .then((ex) => {
        setExercise(ex);
        const initAns: Record<string, string> = {};
        ex.blanks.forEach((b) => {
          initAns[b.blank_key] = "";
        });
        setAnswers(initAns);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [exerciseId]);


  function handleChange(blankKey: string, value: string) {
    setAnswers((prev) => ({ ...prev, [blankKey]: value }));
  }

  // Обработчик "Submit"
  async function handleSubmit() {
    if (!exercise) return;
    if (exercise.exercise_type !== "editing") {
      // если это "reading", ничего не делаем
      return;
    }
    try {
      const resp = await submitExerciseAnswers(exercise.id, answers);
      setResult(resp);

      // === XP и ачивки ===
      if (typeof resp.xp_gained === "number" && resp.xp_gained > 0) {
        addNotification(`You gained +${resp.xp_gained} XP!`, "success");
      }
      if (resp.achievements_unlocked && resp.achievements_unlocked.length > 0) {
        resp.achievements_unlocked.forEach((ach) => {
          addNotification(`Achievement unlocked: ${ach.name}`, "success");
        });
      }
      // Общее уведомление о результате
      if (resp.score >= 80) {
        addNotification("Great job!", "success");
      } else {
        addNotification(`Score = ${resp.score}%. Keep practicing!`, "info");
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  }

  function renderTextWithInputs(text: string) {
    if (!exercise) return text; // fallback

    // словарь blanksByKey
    const blanksByKey = exercise.blanks.reduce((acc, b) => {
      acc[b.blank_key] = b;
      return acc;
    }, {} as Record<string, typeof exercise.blanks[number]>);

    // Регулярка ищет "__...__"
    const regex = /__([a-zA-Z0-9_-]+)__/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const elements: React.ReactNode[] = [];

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index!;
      const fullMatch = match[0]; // "__gap1__"
      const blankKey = match[1];  // "gap1"

      // Добавляем текст ДО плейсхолдера
      if (matchIndex > lastIndex) {
        const segment = text.slice(lastIndex, matchIndex);
        elements.push(<span key={`text-${lastIndex}`}>{segment}</span>);
      }

      const blank = blanksByKey[blankKey];
      if (blank) {
        // Проверим, есть ли info о правильности ответа (если уже есть результат)
        let highlightClass = "text-black"; // по умолчанию — чёрный
        if (result?.details) {
          const detail = result.details.find((d) => d.blank_key === blankKey);
          if (detail) {
            highlightClass = detail.is_correct ? "text-green-600" : "text-red-600";
          }
        }

        // Стили для «невидимого» поля (нет рамки, фон прозрачный)
        const baseFieldStyle = `
          mx-1
          appearance-none
          bg-transparent
          focus:outline-none
          focus:ring-0
          border-b
          border-dotted
          border-gray-400
          hover:border-gray-500
          transition-colors
          ${highlightClass}
        `;

        // Если есть choices (варианты)
        if (blank.choices && blank.choices.length > 0) {
          elements.push(


            
<select
  key={`select-${blankKey}`}
  className="rounded-full shadow-md bg-green-200 hover:bg-green-300 focus:ring-2 focus:ring-green-500 transition duration-300 text-sm px-3 font-sans"
  style={{
    width: `${Math.max(answers[blankKey]?.length * 10 || 80, 80)}px`,
  }}
  disabled={!!result}
  value={answers[blankKey] || ""}
  onChange={(e) => handleChange(blankKey, e.target.value)}
>
  <option value="" disabled hidden>select</option>
  {blank.choices.map((ch, idx) => (
    <option key={`${blankKey}-opt-${idx}`} value={ch}>
      {ch}
    </option>
  ))}

  
</select>
          );
        } else {
          // иначе input
          elements.push(
            <input
            key={`inp-${blankKey}`}
            className="rounded-full shadow-md bg-green-200 hover:bg-green-300 focus:ring-2 focus:ring-green-500 transition duration-300 text-sm px-3 font-sans"
  style={{
    width: `${Math.max(answers[blankKey]?.length * 10 || 80, 80)}px`,
  }} // или уберите эту строку, если не нужна
           /*  placeholder="input" */
            disabled={!!result}
            value={answers[blankKey] || ""}
            onChange={(e) => handleChange(blankKey, e.target.value)}
            
          />
          );
        }
      } else {
        // нет такого blankKey => оставим, как есть
        elements.push(<span key={`unknown-${blankKey}`}>{fullMatch}</span>);
      }

      lastIndex = matchIndex + fullMatch.length;
    }

    // Остаток текста
    if (lastIndex < text.length) {
      const segment = text.slice(lastIndex);
      elements.push(<span key={`text-${lastIndex}`}>{segment}</span>);
    }

    return <>{elements}</>;
  }

  // ====== Рендер ======
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading exercise {exerciseId}...</p>
      </div>
    );
  }
  if (errorMsg) {
    return (
      <div className="p-4 text-red-500">
        {errorMsg}
      </div>
    );
  }
  if (!exercise) {
    return (
      <div className="p-4 text-gray-700">
        No exercise found.
      </div>
    );
  }

  // Получим список только верных ответов (если есть результат)
  const correctDetails = result?.details.filter((d) => d.is_correct) || [];

  return (
    <div
      className="
        relative
        m-4 p-4
        bg-white dark:bg-gray-800
        shadow-lg rounded
        flex flex-col items-center
        justify-center
      "
      style={{ minHeight: "calc(100vh - 8rem)" }}
    >
      {/* Кнопка «Back» */}
      <button
        onClick={() => router.push(`/exercises/${level}`)}
        className="
          absolute top-4 left-4
          text-gray-600 dark:text-gray-200
          hover:text-blue-500
        "
      >
        {/* heroicon arrow-left */}
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

      {/* Заголовок */}
      <h2
        className="
          mt-6 text-lg font-bold
          bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
          text-transparent bg-clip-text
        "
      >
      </h2>

      <div
        className="
          flex-1 flex items-center justify-center
          w-full mt-4 px-4
        "
      >
        <div
          className="
            max-w-3xl
            text-base md:text-lg leading-relaxed
            text-left
            text-gray-800 dark:text-gray-100
            whitespace-normal break-words
          "
        >
          {exercise.exercise_type === "editing" ? (
            <>{renderTextWithInputs(exercise.text)}</>
          ) : (
            <pre className="whitespace-pre-wrap">{exercise.text}</pre>
          )}
        </div>
      </div>

      {/* Если editing → кнопка Submit */}
      {exercise.exercise_type === "editing" && !result && (
        <button
          onClick={handleSubmit}
          className="
            mt-4 px-4 py-2
            bg-gradient-to-r from-purple-400 to-blue-500
            text-white font-semibold
            rounded hover:opacity-90 transition
          "
        >
          Submit
        </button>
      )}

      {/* Плитка с результатами (если есть) */}
      {result && (
        <div
          className="
            w-full max-w-2xl
            mt-6 p-4
            bg-white dark:bg-gray-800
            shadow-md rounded
            transition-transform transform
            hover:scale-105
          "
        >
          <h4 className="text-lg font-semibold text-center mb-4 font-semibold">
            Your Score: {result.score}%
          </h4>

          {/* Если есть верные ответы */}
          <div className="space-y-3 font-semibold">
            {result.details.map((item, idx) => (
              <div key={idx} className="text-sm">
             {/*    <p>Blank: <b>{item.blank_key}</b></p> */}
                <p>
                  Your answer:{" "}
                  <span
                    className={
                      item.is_correct ? "text-green-600" : "text-red-600"
                    }
                  >
                    {item.user_answer}
                  </span>
                </p>
                <p>Correct answer: <i>{item.correct_answer}</i></p>
                {item.is_correct ? (
                  <span className="text-green-600 font-semibold">Correct!</span>
                ) : (
                  <span className="text-red-600 font-semibold">Incorrect</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Если есть неожиданная ошибка */}
      {errorMsg && (
        <p className="text-red-600 text-sm absolute bottom-4 left-1/2 -translate-x-1/2">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
