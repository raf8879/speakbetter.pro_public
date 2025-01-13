/* "use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl">Welcome to ESL Pronunciation</h1>
      {accessToken ? (
        <p>You are logged in!</p>
      ) : (
        <p>You are a guest (not logged in)</p>
      )}

      <ul className="list-disc ml-4 mt-4">
        <li>
          <Link href="/stats">My Progress</Link>
        </li>
        <li>
          <Link href="/levels">Practice Reading (Choose level)</Link>
        </li>
        <li>
          <Link href="/login">Login</Link> or <Link href="/register">Register</Link>
        </li>
      </ul>
    </div>
  );
} */



// my-esl-frontend/app/page.tsx
/* import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to ESL Platform</h1>
      <p>This is the homepage / root page</p>
      <ul style={{ marginTop: 8 }}>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/register">Register</Link></li>
        <li><Link href="/dashboard">Go to Dashboard</Link></li>
      </ul>
    </div>
  );
}  */



// app/page.tsx
/* import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding:20 }}>
      <h1>Welcome to ESL Platform</h1>
      <ul style={{ marginTop:10 }}>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/pronunciation/levels">Pronunciation mode</Link></li>
      </ul>
    </div>
  );
} */

"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Главная страница ("/")
 * - Использует AuthContext для определения, залогинен ли пользователь (user != null).
 * - Если user === null → показываем кнопки "Get Started" / "Sign Up Now".
 * - Если user !== null → показываем "Go to My Account".
 */
export default function HomePage() {
  const { user, isLoading } = useAuth();

  // 1) Если ещё грузится (запрос /api/auth/me), избегаем «моргания»
  //
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // user===null => не авторизован
  const isLoggedIn = !!user;

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center
                   text-center p-8 pt-16 pb-20
                   bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-semibold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to SpeakBetter
        </motion.h1>

        <motion.p
          className="max-w-2xl text-lg md:text-xl text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Your Interactive Platform for Learning English.
          Improve your pronunciation, grammar, and communication skills
          through real-life scenarios and instant feedback.
        </motion.p>

        {/* Кнопка "Get Started" или "Go to My Account" */}
        <div className="mt-6">
          {!isLoggedIn ? (
            <Link
              href="/pronunciation/levels"
              className="mt-auto inline-block px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
             text-white rounded transition self-start animate-gradient bg-[length:200%_200%]"
            >
              Get Started
            </Link>
          ) : (
            <Link
              href="/account"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold 
                         rounded hover:bg-green-500 transition"
            >
              Go to My Account
            </Link>
          )}
        </div>
      </section>

      {/* Основной контент-карточки */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Pronunciation */}
        <motion.div
          className="bg-white rounded-lg shadow p-6 flex flex-col hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.03 }}
        >
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 
                 text-transparent bg-clip-text">Pronunciation</h3>
          <p className="text-gray-700 mb-4">
            Record your speech, get immediate feedback, and track progress.
            Identify problematic words and practice them to perfection.
          </p>
          <Link
            href="/pronunciation/levels"
            className="mt-auto inline-block px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
             text-white rounded transition self-start bg-[length:200%_200%]"
          >
            Practice Pronunciation
          </Link>
        </motion.div>

        {/* Card 2: Conversation */}
        <motion.div
          className="bg-white rounded-lg shadow p-6 flex flex-col hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.03 }}
        >
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                 text-transparent bg-clip-text">Conversation</h3>
          <p className="text-gray-700 mb-4">
            Engage in voice conversations with AI tutors in various scenarios:
            business, travel, doctor visits, and more. Get instant corrections.
          </p>
          <Link
            href="/conversation"
            className="mt-auto inline-block px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
             text-white rounded transition self-start bg-[length:200%_200%]"
          >
            Start Conversation
          </Link>
        </motion.div>

        {/* Card 3: Chat */}
        <motion.div
          className="bg-white rounded-lg shadow p-6 flex flex-col hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.03 }}
        >
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                 text-transparent bg-clip-text">Chat</h3>
          <p className="text-gray-700 mb-4">
            Practice writing in various tenses: past, present, future.
            Get immediate grammar correction and vocabulary hints.
          </p>
          <Link
            href="/chat"
            className="mt-auto inline-block px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
             text-white rounded transition self-start  bg-[length:200%_200%]"
          >
            Open Chat
          </Link>
        </motion.div>

        {/* Card 4: Exercises */}
        <motion.div
          className="bg-white rounded-lg shadow p-6 flex flex-col hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.03 }}
        >
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                 text-transparent bg-clip-text">Exercises</h3>
          <p className="text-gray-700 mb-4">
            Fill in the blanks, read texts, or complete editing tasks.
            Get your score instantly, see which parts need work.
          </p>
          <Link
            href="/exercises"
            className="mt-auto inline-block px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
             text-white rounded transition self-start bg-[length:200%_200%]"
          >
            Explore Exercises
          </Link>
        </motion.div>
      </section>

      {/* Блок о преимуществах */}
      <section className="max-w-4xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                 text-transparent bg-clip-text">Why SpeakBetter?</h2>
        <ul className="list-disc list-inside text-left mx-auto mb-6 max-w-xl text-gray-700">
          <li>Adaptive lessons tailored to your level</li>
          <li>Real-life scenarios with modern AI feedback</li>
          <li>Instant pronunciation checks and corrections</li>
          <li>Detailed progress tracking and insights</li>
        </ul>

        {/* Показываем "Sign Up Now", если не залогинен */}
        {!isLoggedIn && (
          <Link
            href="/register"
            className="mt-auto inline-block px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
             text-white rounded transition self-start animate-gradient bg-[length:200%_200%]"
          >
            Sign Up Now
          </Link>
        )}
      </section>

      {/* Футер */}
      {/* <footer className="bg-gray-100 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-gray-500">
          <span>©️ 2024 SpeakBetter, Inc. All rights reserved.</span>
          <div className="space-x-4">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer> */}
    </main>
  );
}





