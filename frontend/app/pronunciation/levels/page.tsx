"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


export default function PronunciationLevelsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [levels, setLevels] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/register");
      return;
    }


    api
      .get("/api/pronunciation/levels/")
      .then((res) => {
        setLevels(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        setLoadingLevels(false);
      });
  }, [isLoading, user, router]);


  if (isLoading || loadingLevels) {
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


  if (!user) return null;

  return (
    <main className="flex flex-col min-h-screen">
      <section
        className="
          w-full
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
          text-center p-8
        "
      >
        <h2 className="
          text-3xl font-semibold
          bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
          text-transparent bg-clip-text
          mb-2
        ">
          Pronunciation
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Improve your Pronunciation with different difficulty levels, or focus on
          the words you struggle with the most.
        </p>
      </section>
      <section
        className="
          max-w-6xl mx-auto
          px-4 py-10
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-6
        "
      >
        {levels.map((lvl) => (
          <motion.div
            key={lvl}
            className="
              bg-white rounded-lg shadow p-6
              flex flex-col
              hover:shadow-lg transition-shadow
              cursor-pointer
            "
            whileHover={{ scale: 1.03 }}
            onClick={() => router.push(`/pronunciation/levels/${lvl}`)}
          >
            <h3 className="
              text-xl font-semibold mb-2
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            ">
              Level: {lvl}
            </h3>
            <p className="text-gray-700 flex-1">
              Practice reading exercises and get immediate feedback for {lvl} level.
            </p>
          </motion.div>
        ))}
        <motion.div
          className="
            bg-white rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
          whileHover={{ scale: 1.03 }}
          onClick={() => router.push("/practice-words")}
        >
          <h3 className="
            text-xl font-semibold mb-3
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
          ">
            Practice Words
          </h3>
          <p className="text-gray-700 flex-1">
            Focus on the words you often mispronounce. Improve them until perfect!
          </p>
        </motion.div>
      </section>
    </main>
  );
}
