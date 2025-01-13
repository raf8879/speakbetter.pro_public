

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
 * Метаданные Next.js 13+ (опционально)
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
   /*        Пример подключения Google Fonts (если нужно): */
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          />
       }
      </head>

      <body
        className={
          // Базовый фон/цвет:
          "bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 " +
          // Заполняем всю высоту, чтобы футер был «прижат» внизу
          "flex flex-col min-h-screen"
        }
      >
        <ThemeProvider>
          <NotificationsProvider>
            <AuthProvider>
              {/* Шапка (авторизация, приветствие и т.д.) */}
              <HeaderAuth />

              {/*
                Основной контейнер: слева — меню, справа — контент
                flex-1: растягивает на оставшуюся высоту
              */}
              <div className="flex flex-1">
                {/*
                  Сайдбар:
                  - скрыт на мобильных (hidden), показывается при md (md:block)
                  - фиксированная ширина w-64
                  - Добавим "p-4" — небольшой отступ
                  - Можем добавить "space-y-4" между элементами
                  - "overflow-y-auto", если пунктов будет много
                */}
                <aside className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto shadow-sm">
                  <h3 className="text-2xl mb-2 font-mono italic bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-transparent bg-clip-text"
            /*       style={{ fontFamily: '"Great Vibes", cursive' }} */>
                    Course Catalog
                  </h3>

                  {/*
                    "Плиточный" вид: мы хотим, чтобы каждый пункт выглядел как мини-карточка.
                    - Пусть <ul> / <li> будет отвечать за «плитки».
                    - Внутри каждой «плитки» сделаем hover-эффект: 
                      масштабирование + лёгкая тень.
                  */}
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
                          text-transparent bg-clip-text"
                         /*  style={{ fontFamily: '"Great Vibes", cursive' }} */>
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
                          text-transparent bg-clip-text"
                  /*         style={{ fontFamily: '"Great Vibes", cursive' }} */>
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
                          text-transparent bg-clip-text"
                     /*      style={{ fontFamily: '"Great Vibes", cursive' }} */>
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
                          text-transparent bg-clip-text"
                         /*  style={{ fontFamily: '"Great Vibes", cursive' }} */>
                          Exercises
                          </span> 
                      </a>
                    </li>

                    {/* Добавляйте при необходимости... */}
                  </ul>
                </aside>

                {/* Основной контент (children) */}
                <main className="flex-1 p-4 overflow-auto">
                  {children}
                </main>
              </div>

              {/* Футер (внизу) */}
              <Footer />

              {/* Всплывающие уведомления (toast) */}
              <Notifications />
            </AuthProvider>
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
