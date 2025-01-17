"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// import { resendConfirmationEmail } from "@/services/auth"; // Если у вас есть такой endpoint

export default function CheckEmailPage() {
  const router = useRouter();
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleResend() {
    setInfo("");
    setError("");
    try {
      // Если есть endpoint для повторной отправки подтверждения, вызовите его:
      // await resendConfirmationEmail();
      setInfo("A new confirmation email was sent. Please check your inbox.");
    } catch (err: any) {
      setError("Failed to resend confirmation email.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        {/* Заголовок */}
        <h2
          className="
            text-center text-3xl font-greatvibes 
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
            hover:opacity-90 transition-opacity
          "
        >
          Check Your Email
        </h2>

        {/* Основной текст */}
        <p className="mt-4 text-gray-700 dark:text-gray-200 text-center">
          We have sent a confirmation link to your email address.
          Please open the link within the next 10 minutes to verify your account.
        </p>

        {/* Кнопка Resend (необязательно) */}
        <div className="mt-6">
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
        </div>

        {/* Кнопка «Go to Login» */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/login")}
            className="
              text-blue-600 dark:text-blue-400 
              hover:underline text-sm
            "
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
