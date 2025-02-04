"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalInsideCardProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalInsideCard({ open, onClose, children }: ModalInsideCardProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay внутри родителя */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-10 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Контейнер контента */}
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 w-full max-w-md relative">
              {/* Крестик (закрыть) */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}