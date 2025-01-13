// components/BlackDiamondLink.tsx
"use client";
import Link from "next/link";
import React from "react";

/**
 * Чёрная кнопка-ссылка с анимированным «алмазом» (sparkle).
 */
export default function BlackDiamondLink({
  href,
  children,
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        relative inline-block px-4 py-2 
        text-white font-semibold rounded 
        bg-black
        overflow-hidden
        hover:opacity-90 transition
      `}
    >
      <span
        className={`
          absolute top-1/2 left-0 
          w-2 h-2 bg-white 
          rotate-45 
          opacity-0 
          animate-sparkle-move
        `}
        style={{ marginTop: "-4px" }}
      />
      <span className="relative">{children || "Sign Up Now"}</span>
    </Link>
  );
}
