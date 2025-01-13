"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function HeaderAuth() {
  const { user, isLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Пока грузим профиль, можно показать лоадер
  if (isLoading) {
    return (
      <header className="bg-gray-200 dark:bg-gray-800 p-4 text-center">
        Loading...
      </header>
    );
  }

  return (
    <header className="bg-gray-100 dark:bg-gray-800 px- p-1.5 flex items-center justify-between">
      {/* Лого → кликаем, чтобы вернуться на главную */}
      <Link
        href="/"
        className="text-3xl font-greatvibes bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                  text-transparent bg-clip-text hover:opacity-90 transition-opacity"
      >
        SpeakBetter
      </Link>

      <div className="flex items-center gap-4">
        {/* Тумблер темы */}
        <button
          onClick={toggleTheme}
          className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-200"
        >
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>

        {user ? (
          <>
          {/* Кликабельный привет → /account */}
          <Link
            href="/account"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
          >
            Hello, {user.username}!
          </Link>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
