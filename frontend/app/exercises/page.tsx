"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const levels = ["Beginner", "Intermediate", "Advanced"];

export default function ExercisesIndexPage() {
  const router = useRouter();

  function handleLevelClick(lvl: string) {
    router.push(`/exercises/${lvl}`);
  }

  return (
    <main className="flex flex-col min-h-screen">
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
          Exercises
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Choose your level to explore reading/editing tasks and improve your skills.
        </p>
      </section>

      {/* Карточки уровней */}
      <section className="
        max-w-6xl mx-auto
        px-4 py-10
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        gap-6
      ">
        {levels.map((level) => (
          <motion.div
            key={level}
            whileHover={{ scale: 1.02 }}
            className="
              bg-white rounded-lg shadow p-6
              flex flex-col
              hover:shadow-lg transition-shadow
              cursor-pointer
            "
            onClick={() => handleLevelClick(level)}
          >
            <h3
              className="
                text-xl font-semibold mb-2
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              {level}
            </h3>
            <p className="text-gray-700 flex-1">
              {level === "Beginner" &&
                "Start from basic reading or fill-in-the-blanks tasks."}
              {level === "Intermediate" &&
                "Challenge yourself with more complex grammar and longer texts."}
              {level === "Advanced" &&
                "Push your limits with advanced content and detailed editing tasks."}
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
