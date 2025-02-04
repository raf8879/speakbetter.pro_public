"use client";

import React, { useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * Полукруг сверху: слева→направо (как «спидометр»).
 * @param value 0..100 (%)
 */
interface SemiCircleGaugeTopProps {
  value: number;         // Процент заполнения
  width?: number;        // px
  height?: number;       // px (обычно ~ width/2)
  strokeWidth?: number;  // Толщина
  showOutline?: boolean; // Рисовать ли серую подложку
}

export default function SemiCircleGaugeTop({
  value,
  width = 200,
  height = 100,
  strokeWidth = 14,
  showOutline = true,
}: SemiCircleGaugeTopProps) {
  // Clamp 0..100
  const clampedVal = Math.max(0, Math.min(100, value));

  // Создаём MotionValue, будем анимировать его в useEffect
  const progress = useMotionValue(0);

  React.useEffect(() => {
    // Анимируем к clampedVal за 1 секунду
    const controls = animate(progress, clampedVal, {
      duration: 1,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [clampedVal, progress]);

  // fraction 0..1
  const fraction = useTransform(progress, (latest) => latest / 100);

  // Хотим текст, округлённый: 0..100
  const displayValue = useTransform(progress, (latest) =>
    Math.round(latest)
  );

  // Вычисляем длину дуги (полукруга)
  const R = (width - strokeWidth) / 2;
  const arcLength = Math.PI * R; // полукруг => π*R
  const dashOffset = useTransform(fraction, (f) => (1 - f) * arcLength);

  // Цвет: красный→зелёный
  const strokeColor = useTransform(fraction, (f) => {
    // 0..0.5 => #f00 -> #ffa500
    // 0.5..1 => #ffa500 -> #0f0
    if (f <= 0.5) {
      const local = f / 0.5;
      return interpolateColor("#ff0000", "#ffa500", local);
    } else {
      const local = (f - 0.5) / 0.5;
      return interpolateColor("#ffa500", "#00ff00", local);
    }
  });

  const arcPath = useMemo(() => {
    return describeArc(width / 2, 0, R, 180, 360);
  }, [width, R]);

  return (
    <div style={{ width, height }} className="relative">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Подложка – тёмная дуга (если надо) */}
        {showOutline && (
          <path
            d={arcPath}
            fill="none"
            stroke="#444"
            strokeOpacity={0.3}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* Белая/серая или совсем none? */}
        <path
          d={arcPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={showOutline ? strokeWidth - 4 : strokeWidth}
          strokeLinecap="round"
        />
        {/* Заполняемая дуга */}
        <motion.path
          d={arcPath}
          fill="none"
          strokeWidth={showOutline ? strokeWidth - 4 : strokeWidth}
          strokeLinecap="round"
          stroke={strokeColor}
          strokeDasharray={arcLength}
          style={{
            strokeDashoffset: dashOffset,
          }}
        />
      </svg>

      {/* Текст (проценты) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.span className="text-sm font-bold">
          <motion.span>{displayValue}</motion.span>%
        </motion.span>
      </div>
    </div>
  );
}

/** Генерация дуги через startAngle→endAngle */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

/** перевод угла в радианы -> координаты на окружности */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad) * -1, 
  };
}

function interpolateColor(color1: string, color2: string, t: number) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex: string) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
