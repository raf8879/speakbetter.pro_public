"use client";

import React from "react";

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4 text-gray-700 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="text-sm text-gray-500">
        Have questions, feedback, or need help? We’d love to hear from you!
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-2">Email</h2>
        <p>
          For inquiries or support, email us at
          <a href="mailto:info.speakbetterai@gmail.com" className="underline ml-1">
            info.speakbetterai@gmail.com
          </a>.
        </p>
        
      </section>

{/*       <section>
        <h2 className="text-xl font-semibold mb-2">GitHub</h2>
        <p>
          Want to see the source code or report an issue? Visit our
          <a
            href="https://github.com/YourUsername/YourRepo"
            target="_blank"
            rel="noreferrer"
            className="underline ml-1"
          >
            GitHub repository
          </a>.
        </p>
      </section> */}

{/*       <section>
        <h2 className="text-xl font-semibold mb-2">Feedback Form</h2>
        <p>
          Prefer using a form? Fill out our quick
          <a href="/feedback-form" className="underline ml-1">
            feedback form
          </a>.
        </p>
      </section> */}
      
    </main>
  );
}
