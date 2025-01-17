"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth";

// Пример простейшей проверки «надёжности» пароля:
// можно усложнить по желанию.
function validatePasswordStrength(password: string): string | null {
  // 1) Минимальная длина
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  // 2) Хотим минимум 1 цифру:
  if (!/\d/.test(password)) {
    return "Password must contain at least one digit.";
  }
  // 3) Хотим минимум 1 спецсимвол (например, !@#$%^&*):
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*).";
  }
  // 4) (Опционально) Хотим хотя бы одну заглавную букву:
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  return null; // Всё ок
}

export default function RegisterPage() {
  const router = useRouter();

  // Поля формы
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Сообщения
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo("");
    setError("");

    // 1) Проверяем, совпадают ли пароли
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // 2) Проверяем «надёжность» пароля
    const pwError = validatePasswordStrength(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    // 3) Отправляем запрос
    try {
      await registerUser(username, password, email);
      // Успешно → показываем сообщение и тут же переходим на /login
      setInfo("User created. Please check your email for a confirmation link.");
      router.push("/check-email");
    } catch (err: any) {
      // Если бэкенд вернёт ошибку (например, пользователь уже существует)
      setError(err.response?.data?.error || "Register error");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm
        bg-white dark:bg-gray-800
        rounded-lg
        shadow-md
        p-8">
        {/* Заголовок с градиентом */}
        <h2
          className="
            text-center text-3xl font-greatvibes bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                  text-transparent bg-clip-text hover:opacity-90 transition-opacity
          "
        >
          Create an Account
        </h2>

        {/* Сообщения об ошибках/информации */}
        {error && (
          <p className="text-red-600 dark:text-red-400 mb-2 text-center">
            {error}
          </p>
        )}
        {info && (
          <p className="text-green-600 dark:text-green-400 mb-2 text-center">
            {info}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Username */}
          <div>
            <input
              className="
                w-full border border-gray-300 dark:border-gray-600 
                px-3 py-2 rounded 
                focus:outline-none focus:ring focus:ring-purple-300
                text-gray-700 dark:text-gray-200
                bg-gray-50 dark:bg-gray-700
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              className="
                w-full border border-gray-300 dark:border-gray-600 
                px-3 py-2 rounded 
                focus:outline-none focus:ring focus:ring-purple-300
                text-gray-700 dark:text-gray-200
                bg-gray-50 dark:bg-gray-700
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              className="
                w-full border border-gray-300 dark:border-gray-600 
                px-3 py-2 rounded 
                focus:outline-none focus:ring focus:ring-purple-300
                text-gray-700 dark:text-gray-200
                bg-gray-50 dark:bg-gray-700
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              className="
                w-full border border-gray-300 dark:border-gray-600 
                px-3 py-2 rounded 
                focus:outline-none focus:ring focus:ring-purple-300
                text-gray-700 dark:text-gray-200
                bg-gray-50 dark:bg-gray-700
              "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            className="
              w-full py-2 mt-2
              bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400
              text-white font-semibold rounded
              hover:opacity-90 transition
            "
            type="submit"
          >
            Register
          </button>
        </form>

        {/* Ссылка «Already have an account? Login» */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
          </span>
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
