"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "@/services/authReset";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromURL = searchParams.get("token") || ""; // /reset-password?token=...
  
  const [token, setToken] = useState(tokenFromURL);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    // Если нет token в URL, выводим ошибку
    if (!tokenFromURL) {
      setErrorMsg("No reset token in URL.");
    }
  }, [tokenFromURL]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!token) {
      setErrorMsg("Missing token");
      return;
    }
    try {
      // POST /api/auth/password-reset/confirm/
      // body: { token, password, password_confirm }
      const resp = await confirmPasswordReset(token, password, passwordConfirm);
      // resp: { message: "Password has been reset. You can now login." }
      setInfoMsg(resp.message || "Password reset success. You can login now.");

      // Например, через 2 секунды после успеха можно перекинуть на логин
      // setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="
        w-full max-w-sm
        bg-white dark:bg-gray-800
        rounded-lg
        shadow-md
        p-8
      ">
        <h2 className="
          text-center text-3xl font-greatvibes bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                  text-transparent bg-clip-text hover:opacity-90 transition-opacity
        ">
          Reset Your Password
        </h2>

        {/* Ошибка или информационное сообщение */}
        {errorMsg && (
          <p className="text-red-600 dark:text-red-400 mb-2 text-center">
            {errorMsg}
          </p>
        )}
        {infoMsg && (
          <p className="text-green-600 dark:text-green-400 mb-2 text-center">
            {infoMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
           {/*  <label className="block mb-1 font-semibold text-sm">New Password:</label> */}
            <input
              className="
                w-full border border-gray-300 dark:border-gray-600 
                px-3 py-2 rounded 
                focus:outline-none focus:ring focus:ring-purple-300
                text-gray-700 dark:text-gray-200
                bg-gray-50 dark:bg-gray-700
              "
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            {/* <label className="block mb-1 font-semibold text-sm">Confirm Password:</label> */}
            <input
              className="
                w-full border border-gray-300 dark:border-gray-600 
                px-3 py-2 rounded 
                focus:outline-none focus:ring focus:ring-purple-300
                text-gray-700 dark:text-gray-200
                bg-gray-50 dark:bg-gray-700
              "
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button
            type="submit"
            className="
              w-full py-2 mt-2
             bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400
              text-white font-semibold rounded
              hover:opacity-90 transition
            "
          >
            Update Password
          </button>
        </form>

        {/* Кнопка «Назад» (необязательно) */}
        <button
          onClick={() => router.push("/login")}
          className="
            mt-4 inline-block text-blue-600 dark:text-blue-400
            hover:underline text-sm
          "
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
