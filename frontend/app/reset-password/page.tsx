"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { confirmPasswordReset } from "@/services/authReset";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("token") || "";
      if (!t) {
        setErrorMsg("No reset token in URL. Please check your link.");
      }
      setToken(t);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!token) {
      setErrorMsg("Missing token in URL");
      return;
    }

    try {
      const resp = await confirmPasswordReset(token, password, passwordConfirm);
      setInfoMsg(resp.message || "Password reset success. You can now login.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(String(err));
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div
        className="
          w-full max-w-sm
          bg-white dark:bg-gray-800
          rounded-lg
          shadow-md
          p-8
        "
      >
        <h2
          className="
            text-center text-3xl font-greatvibes 
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text 
            hover:opacity-90 transition-opacity
          "
        >
          Reset Your Password
        </h2>
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
              text-white font-semibold 
              rounded 
              hover:opacity-90 transition
            "
          >
            Update Password
          </button>
        </form>
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
