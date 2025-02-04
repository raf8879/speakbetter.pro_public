"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { verifyEmail } from "@/services/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("token") || "";
      if (!t) {
        setError("No token in URL. Please check your verification link.");
      }
      setToken(t);
    }
  }, []);

  async function handleVerify() {
    setInfo("");
    setError("");

    if (!token) {
      setError("No token found. Please check your verification link.");
      return;
    }

    try {
      await verifyEmail(token);
      setInfo("Email verified. You can now login.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Verification error");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown verification error");
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
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
          Verify Your Email
        </h2>
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
        {token && (
          <button
            onClick={handleVerify}
            className="
              w-full py-2 mt-6
              bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400
              text-white font-semibold 
              rounded 
              hover:opacity-90 transition
            "
          >
            Verify
          </button>
        )}

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
