"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface LevelTileProps {
  level: string;
  onClick?: (lvl:string)=>void; 

}

export default function LevelTile({ level, onClick }: LevelTileProps) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick(level);
    } else {
      // например, дефолтный переход
      router.push(`/pronunciation/levels/${level}`);
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow p-4 
        hover:shadow-lg transition-shadow
        cursor-pointer
        flex flex-col items-center
        w-32 sm:w-40 
      "
    >
      <h4 
        className="
          text-md font-semibold 
          bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
          text-transparent bg-clip-text
          mb-1
        "
      >
        {level}
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        {/* Подпись под уровнем, если нужно */}
        {level === "Beginner" && "A1/A2 basics"}
        {level === "Intermediate" && "B1/B2 middle"}
        {level === "Advanced" && "C1+ high-level"}
      </p>
    </motion.div>
  );
}
