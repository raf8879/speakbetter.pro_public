

"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

/**
 * Страница /account (краткий обзор личного кабинета),
 * оформленная в стиле "ExercisesIndexPage".
 */
export default function AccountIndexPage() {
  const { user, isLoading } = useAuth();

  // 1) Пока AuthContext грузит...
  if (isLoading) {
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
            My Account
          </h2>
          <p className="max-w-2xl mx-auto text-gray-700">
            Please wait, loading your profile...
          </p>
        </section>

        <section className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading your profile...</p>
        </section>
      </main>
    );
  }

  // 2) Если не авторизован
  if (!user) {
    return (
      <main className="flex flex-col min-h-screen">
        {/* Шапка */}
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
            My Account
          </h2>
          <p className="max-w-2xl mx-auto text-gray-700">
            You are not authorized. Please log in or sign up.
          </p>
        </section>

        <section
          className="
            flex-1 flex items-center justify-center
            text-center
          "
        >
          <div className="text-red-600">
            <p className="mb-4">Not authorized.</p>
            <p>
              Please{" "}
              <Link
                href="/login"
                className="text-blue-600 underline hover:text-blue-800"
              >
                log in
              </Link>{" "}
              or{" "}
              <Link
                href="/register"
                className="text-blue-600 underline hover:text-blue-800"
              >
                sign up
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    );
  }

  // 3) Если авторизован
  return (
    <main className="flex flex-col min-h-screen">
      {/* Градиентная «шапка» */}
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
          My Account
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Welcome to your personal cabinet, {user.username}!
        </p>
      </section>

      {/* Основная часть (карточки или одна карточка) */}
      <section
        className="
          max-w-6xl mx-auto
          px-4 py-10
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
          gap-6
        "
      >
        {/* Карточка "Edit Account Details" */}
        <motion.div
          key="profile-card"
          whileHover={{ scale: 1.02 }}
          className="
            bg-white rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
        >
          <Link href="/account/profile" className="flex-1">
            <h3
              className="
                text-xl font-semibold mb-2
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              Edit Account Details
            </h3>
            <p className="text-gray-700">
              Update your personal info: name, email and more.
            </p>
          </Link>
        </motion.div>

        {/* Карточка "Statistics" */}
        <motion.div
          key="stats-card"
          whileHover={{ scale: 1.02 }}
          className="
            bg-white rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
        >
          <Link href="/account/stats" className="flex-1">
            <h3
              className="
                text-xl font-semibold mb-2
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              Statistics
            </h3>
            <p className="text-gray-700">
              View your progress, achievements and more.
            </p>
          </Link>
        </motion.div>

        {/* Карточка "Delete Account" (или что-то ещё) */}
{/*         {<motion.div
          key="delete-card"
          whileHover={{ scale: 1.02 }}
          className="
            bg-white rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
        >
          <Link href="/admin/dashboard" className="flex-1">
            <h3
              className="
                text-xl font-semibold mb-2
                bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                text-transparent bg-clip-text
              "
            >
              Delete Account
            </h3>
            <p className="text-gray-700">
              Permanently remove your data.
            </p>
          </Link>
        </motion.div>} */}
      </section>
    </main>
  );
}

