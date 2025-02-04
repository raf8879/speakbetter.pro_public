import "./globals.css";
import React from "react";


// Провайдеры
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

// Компоненты
import HeaderAuth from "@/components/HeaderAuth";
import Footer from "@/components/Footer";
import Notifications from "@/components/Notifications";
console.log("DEBUG: NotificationsProvider =", NotificationsProvider);
console.log("DEBUG: AuthProvider =", AuthProvider);
/**
 */
export const metadata = {
  title: "SpeakBetter",
  description: "Your ESL platform for learning English with AI help"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          />
       }
      </head>

      <body
        className={
          //
          "bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 " +
          //
          "flex flex-col min-h-screen"
        }
      >
        <ThemeProvider>
          <NotificationsProvider>
            <AuthProvider>
              <HeaderAuth />

              <div className="flex flex-1">

                <aside className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto shadow-sm">
                  <h3 className="text-2xl mb-2 font-mono italic bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-transparent bg-clip-text">
                    Course Catalog
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="/pronunciation/levels"
                        className={`
                          block p-3 rounded-md
                          bg-white dark:bg-gray-700 
                          text-gray-700 dark:text-gray-100
                          shadow 
                          transition-transform duration-200 
                          hover:scale-105
                          hover:shadow-lg
                        `}
                        >
                          <span className="text-xl font-mono italic  mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                          text-transparent bg-clip-text">
                          Pronunciation
                          </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="/conversation"
                        className={`
                          block p-3 rounded-md
                          bg-white dark:bg-gray-700 
                          text-gray-700 dark:text-gray-100
                          shadow
                          transition-transform duration-200
                          hover:scale-105
                          hover:shadow-lg
                        `}
                      >
                        <span className="text-xl font-mono italic mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                          text-transparent bg-clip-text">
                          Conversation
                          </span>              
                      </a>
                    </li>
                    <li>
                      <a
                        href="/chat"
                        className={`
                          block p-3 rounded-md
                          bg-white dark:bg-gray-700
                          text-gray-700 dark:text-gray-100
                          shadow
                          transition-transform duration-200
                          hover:scale-105
                          hover:shadow-lg
                        `}
                      >
                        <span className="text-xl font-mono italic mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                          text-transparent bg-clip-text">
                          Chat
                          </span>  
                      </a>
                    </li>
                    <li>
                      <a
                        href="/exercises"
                        className={`
                          block p-3 rounded-md
                          bg-white dark:bg-gray-700
                          text-gray-700 dark:text-gray-100
                          shadow
                          transition-transform duration-200
                          hover:scale-105
                          hover:shadow-lg
                        `}
                      >
                        <span className="text-xl font-mono italic mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                          text-transparent bg-clip-text">
                          Exercises
                          </span> 
                      </a>
                    </li>
                  </ul>
                </aside>
                <main className="flex-1 p-4 overflow-auto">
                  {children}
                </main>
              </div>
              <Footer />
              <Notifications />
            </AuthProvider>
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
