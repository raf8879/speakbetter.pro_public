"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchExercises, Exercise } from "@/services/exercises";

export default function ExercisesByLevelPage() {
  const params = useParams();
  const router = useRouter();
  const level = params.level as string;

  const [exList, setExList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchExercises(level)
      .then((data) => {
        setExList(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to load exercises");
        setLoading(false);
      });
  }, [level]);

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading exercises for {level}...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4">
        <p className="text-red-600">{errorMsg}</p>
      </div>
    );
  }

  // Если список пуст → показать сообщение
  if (exList.length === 0) {
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
            Exercises for {level}
          </h2>
        </section>

        <section className="max-w-3xl mx-auto text-center">
          <p className="text-gray-700">
            No exercises found for this level. Check again later!
          </p>
        </section>
      </main>
    );
  }

  // Иначе показываем «карточки» упражнений
  function handleClickExercise(exerciseId: number) {
    router.push(`/exercises/${level}/${exerciseId}`);
  }

  return (
    <main className="p-4 flex flex-col min-h-screen">
      {/* Верхний «баннер» с градиентом */}
      <section
        className="
          mb-6 text-center
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
          py-6 px-2 rounded
        "
      >
        {/* Кнопка назад */}
        <button
          onClick={() => router.push("/exercises")}
          className="
            text-left mb-4
            text-gray-700 hover:text-gray-900
            font-semibold
            flex items-center
            ml-2
          "
        >
          {/* Иконка ← */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth={2} stroke="currentColor"
            className="w-5 h-5 mr-1"
          >
            <path
              strokeLinecap="round" strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 
                 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>

        {/* Заголовок */}
        <h2
          className="
            text-2xl font-semibold
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
          "
        >
          Exercises for {level}
        </h2>
        <p className="text-gray-700 mt-2">
          Select an exercise to practice your skills.
        </p>
      </section>

      {/* Сетка «карточек» */}
      <section
        className="
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
          gap-4 max-w-5xl mx-auto
        "
      >
        {exList.map((ex) => (
          <motion.div
            key={ex.id}
            className="
              bg-white rounded-lg shadow p-4
              flex flex-col
              hover:shadow-lg transition-shadow
              cursor-pointer
            "
            whileHover={{ scale: 1.02 }}
            onClick={() => handleClickExercise(ex.id)}
          >
            {/* Название упражнения */}
            <h3
              className="
                text-lg font-semibold mb-1
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              {ex.title}
            </h3>
            <p className="text-gray-600 mb-2">
              Type: <strong>{ex.exercise_type}</strong>
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}