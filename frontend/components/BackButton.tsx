// components/BackButton.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

interface BackButtonProps {
  text?: string;
  onClick?: () => void;
}

export default function BackButton({ text = "", onClick }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick();
    } else {
      router.back(); 
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="
        inline-flex items-center 
        px-3 py-1 text-sm 
        bg-gray-200 hover:bg-gray-300 
        dark:bg-gray-700 dark:hover:bg-gray-600 
        text-gray-800 dark:text-gray-100
        rounded 
        transition-colors
      "
    >
      <FaArrowLeft className="mr-2" />
      {text}
    </motion.button>
  );
}
