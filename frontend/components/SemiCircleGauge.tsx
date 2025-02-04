"use client";

import React from "react";
import { motion } from "framer-motion";


interface SemiCircleGaugeProps {
  value: number;
  width?: number;
  height?: number;
  colorFrom?: string;
  colorTo?: string;
  label?: string;
}

export default function SemiCircleGauge({
  value,
  width = 200,
  height = 100,
  colorFrom = "red",
  colorTo = "green",
  label,
}: SemiCircleGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const circumference = Math.PI * (width - 10);

  const offset = ((100 - clampedValue) / 100) * circumference;

  return (
    <div style={{ width, height }} className="relative flex items-center justify-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height * 2}`}
        style={{ transform: "rotate(-180deg)" }}
      >
        {/* Фоновая дуга */}
        <path
          d={describeArc(width / 2, height * 2, (width - 10) / 2, 180, 0)}
          stroke="#eee"
          strokeWidth={10}
          fill="none"
        />
        {/* Анимируемая дуга */}
        <motion.path
          d={describeArc(width / 2, height * 2, (width - 10) / 2, 180, 0)}
          stroke={interpolateColor(clampedValue, colorFrom, colorTo)}
          strokeWidth={10}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1 }}
        />
      </svg>

      {/* Числовое значение и label */}
      <div className="absolute text-center">
        <div className="text-lg font-bold">
          {clampedValue.toFixed(0)}%
        </div>
        {label && <div className="text-sm text-gray-500">{label}</div>}
      </div>
    </div>
  );
}


function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy - (r * Math.sin(angleInRadians)),
  };
}

/** Простейшая интерполяция цвета: если <50 => colorFrom, иначе colorTo. */
function interpolateColor(value: number, fromColor: string, toColor: string) {
  if (value < 50) return fromColor;
  return toColor;
}
