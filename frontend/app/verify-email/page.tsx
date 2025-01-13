

"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/services/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleVerify() {
    setInfo("");
    setError("");
    try {
      await verifyEmail(token);
      setInfo("Email verified. You can now login.");
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification error");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
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
          Verify Your Email
        </h2>

        {/* Если нет токена в URL */}
        {!token && (
          <p className="text-center text-red-500">
            No token in URL. Please check your verification link.
          </p>
        )}

        {/* Ошибки и успехи */}
        {error && (
          <p className="text-red-600 mt-4 text-center">
            {error}
          </p>
        )}
        {info && (
          <p className="text-green-600 mt-4 text-center">
            {info}
          </p>
        )}

        {/* Кнопка Verify (только если token есть) */}
        {token && (
          <button
            onClick={handleVerify}
            className="
              w-full py-2 mt-6
              bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400
              text-white font-semibold rounded
              hover:opacity-90 transition
            "
          >
            Verify
          </button>
        )}

        {/* Опциональная ссылка «Back to Home» или «Login» */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
