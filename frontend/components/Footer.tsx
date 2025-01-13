"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 p-4 mt-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>© 2024 SpeakBetter.</span>
        <div className="space-x-4">
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
