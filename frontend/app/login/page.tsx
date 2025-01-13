"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      await loginUser(username, password);
      // Обновляем контекст (запрашиваем /me, чтобы узнать пользователя)
      await refreshProfile();
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Login error");
    }
  }

  return (
    <div className="
      flex min-h-screen
      items-center justify-center
      bg-gray-50 dark:bg-gray-900
      px-4
    ">
      <div className="
        w-full max-w-sm
        bg-white dark:bg-gray-800
        rounded-lg
        shadow-md
        p-8
      ">
        <h2
className="text-center text-3xl font-greatvibes bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                  text-transparent bg-clip-text hover:opacity-90 transition-opacity"
        >
          SpeakBetter
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          
            </label>
            <input
              className="
                w-full
                px-3 py-2
                border border-gray-300 dark:border-gray-700
                rounded-md
                focus:outline-none focus:ring focus:ring-purple-300
                bg-gray-50 dark:bg-gray-700
                text-gray-800 dark:text-gray-100
              "
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            </label>
            <input
              className="
                w-full
                px-3 py-2
                border border-gray-300 dark:border-gray-700
                rounded-md
                focus:outline-none focus:ring focus:ring-purple-300
                bg-gray-50 dark:bg-gray-700
                text-gray-800 dark:text-gray-100
              "
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="
              w-full
              py-2 mt-4
              bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400
              text-white font-semibold
              rounded-md
              hover:opacity-90
              transition
            "
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          <a href="/forgot-password" 
            className="
            text-sm text-center 
            text-blue-600 hover:underline
          ">
            Forgot password?
          </a>
        </div>
    

        <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          <p>
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="
                text-blue-600 dark:text-blue-400
                hover:underline
              "
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
