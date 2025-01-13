"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/services/authReset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfoMsg("");
    setErrorMsg("");
    try {
      // 1) отправляем email на /api/auth/password-reset/
      const resp = await requestPasswordReset(email);
      // resp: { message: "If the account exists, a reset link has been sent." }
      setInfoMsg(resp.message || "Check your email for further instructions.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="
        w-full max-w-sm
        bg-white dark:bg-gray-800
        rounded-lg
        shadow-md
        p-8
      ">
        <h2 className="text-center text-3xl font-greatvibes bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                  text-transparent bg-clip-text hover:opacity-90 transition-opacity">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
{/*             <label className="block mb-1 font-semibold text-sm">Email Address:</label> */}
            <input
              type="email"
              className="w-full border border-gray-300 px-3 py-2 rounded 
                        focus:outline-none focus:ring focus:ring-purple-300"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 
                       bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400
                       text-white rounded font-semibold 
                       hover:opacity-90 transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Информационное сообщение или ошибка */}
        {infoMsg && <p className="text-green-600 mt-4 text-center">{infoMsg}</p>}
        {errorMsg && <p className="text-red-600 mt-4 text-center">{errorMsg}</p>}

        {/* Ссылка «Back to Login» */}
        <button
          onClick={() => router.push("/login")}
          className=" mt-4 inline-block text-blue-600  hover:underline text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
