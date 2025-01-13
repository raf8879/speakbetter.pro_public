"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

/**
 * CircleGaugeProps:
 * - value: число 0..100 (процент)
 * - size: диаметр круга (px)
 * - strokeWidth: толщина обводки (px)
 * - gradientId: уникальный id для <defs> (если в одном месте несколько диаграмм)
 * - label?: string; Подпись под диаграммой (например "Accuracy")
 */
interface CircleGaugeProps {
  value: number;          // 0..100
  size?: number;          // px
  strokeWidth?: number;   // px
  gradientId?: string;
  label?: string;         // подпись под числом
}

export default function CircleGauge({
  value,
  size = 120,
  strokeWidth = 12,
  gradientId = "circleGradient",
  label,
}: CircleGaugeProps) {
  // motionValue для анимации
  const mvProgress = useMotionValue(0);
  // локальный стейт: хранит «число» для финального рендера
  const [progress, setProgress] = useState(0); // 0..100

  // При изменении входного value (0..100) анимируем motionValue
  useEffect(() => {
    // ограничим в пределах [0..100]
    const target = Math.max(0, Math.min(100, value));
    const controls = animate(mvProgress, target, {
      duration: 1.4,
      ease: [0.22, 0.85, 0.32, 1], // "cubic-bezier" для плавной анимации
    });
    return controls.stop;
  }, [value, mvProgress]);

  // Подписываемся на изменения mvProgress
  useEffect(() => {
    const unsub = mvProgress.on("change", (v) => {
      setProgress(Math.round(v)); // округляем
    });
    return unsub;
  }, [mvProgress]);

  // Расчёт радиуса и длины окружности
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Смещение (dashOffset)
  const offset = ((100 - progress) / 100) * circumference;

  // При 0 не показываем "заливку"
  const showCircle = progress > 0; // хотим скрыть, если = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9f7aea" />   {/* purple-600 */}
            <stop offset="50%" stopColor="#d53f8c" />  {/* pink-500   */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500   */}
          </linearGradient>
        </defs>

        {showCircle && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.2s linear" }}
          />
        )}
      </svg>

      {/* Числовое значение по центру (если progress>0) */}
      {showCircle && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            {progress}%
          </span>
          {label && (
            <span className="mt-1 text-xs text-gray-600 dark:text-gray-200">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
