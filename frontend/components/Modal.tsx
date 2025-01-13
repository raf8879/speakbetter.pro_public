// components/Modal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // клик по фону закрывает
          />
          {/* Контейнер контента */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <div
              className="relative bg-white dark:bg-gray-800 rounded shadow-lg p-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Крестик */}
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
