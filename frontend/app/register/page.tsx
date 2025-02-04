"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth";


function validatePasswordStrength(password: string): string | null {

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one digit.";
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*).";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  return null; //
}

export default function RegisterPage() {
  const router = useRouter();


  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo("");
    setError("");


    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const pwError = validatePasswordStrength(password);
    if (pwError) {
      setError(pwError);
      return;
    }


    try {
      await registerUser(username, password, email);
      // Успешно → показываем сообщение и тут же переходим на /login
      setInfo("User created. Please check your email for a confirmation link.");
      router.push("/check-email");
    } catch (err: any) {
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
        <h2
          className="
            text-center text-3xl font-greatvibes bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
                  text-transparent bg-clip-text hover:opacity-90 transition-opacity
          "
        >
          Create an Account
        </h2>
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
