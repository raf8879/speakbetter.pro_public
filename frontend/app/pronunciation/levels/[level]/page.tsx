"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Exercise {
  id: number;
  title: string;
  level: string;
}

export default function ExercisesByLevelPage() {
  const router = useRouter();
  const params = useParams();
  const level = params.level as string;

  const [exList, setExList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isLoading } = useAuth(); // AuthContext: user, isLoading

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    api
      .get(`/api/pronunciation/exercises/?level=${encodeURIComponent(level)}`)
      .then((res) => {
        setExList(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [level, router, user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="p-4">
        <p>Loading exercises for level <strong>{level}</strong>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!user) return null;

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
        <p className="text-gray-700 mt-2">
          Choose an exercise below to practice your pronunciation skills.
        </p>
      </section>
      <section
        className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-4 max-w-5xl mx-auto
        "
      >
        {exList.map((ex) => (
          <motion.div
            key={ex.id}
            className="
              bg-white rounded-lg shadow p-4  /*size  */
              flex flex-col
              hover:shadow-lg transition-shadow
              cursor-pointer
            "
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push(`/pronunciation/levels/${level}/${ex.id}`)}
          >
            <h3
              className="
                text-lg font-semibold mb-2
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              {ex.title}
            </h3>
            <p className="text-gray-600">
              Level: <strong>{ex.level}</strong>
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
