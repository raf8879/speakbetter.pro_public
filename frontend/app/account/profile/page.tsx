"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { getMyProfile, updateMyProfile, deleteAccount } from "@/services/user";

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black bg-opacity-30
        "
      >
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="
            relative
            bg-white dark:bg-gray-800
            rounded shadow-lg p-6
            max-w-md w-full
          "
        >
          {/* Кнопка «закрыть» */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function AccountPage() {
  const router = useRouter();

  // Данные профиля, загрузка, и т.д.
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Модалки
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Поля редактирования
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Для удаления аккаунта
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
      })
      .catch((err: any) => {
        setError(err.response?.data?.detail || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ====== Обработчики клика по карточкам ======
  function handleOpenNameModal() {
    if (!profile) return;
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setError("");
    setMsg("");
    setEditNameOpen(true);
  }

  function handleOpenEmailModal() {
    if (!profile) return;
    setNewEmail(profile.email || "");
    setError("");
    setMsg("");
    setEditEmailOpen(true);
  }

  function handleOpenDeleteModal() {
    setDeletePassword("");
    setError("");
    setMsg("");
    setDeleteOpen(true);
  }

  // ====== Сохранение имени ======
  async function handleSaveName() {
    setError("");
    setMsg("");
    try {
      const updated = await updateMyProfile({
        first_name: firstName,
        last_name: lastName,
      });
      setProfile(updated);
      setMsg("Name updated successfully!");
      setEditNameOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // ====== Сохранение email ======
  async function handleSaveEmail() {
    setError("");
    setMsg("");
    try {
      const updated = await updateMyProfile({ email: newEmail });
      setProfile(updated);
      setMsg("Email updated successfully!");
      setEditEmailOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // ====== Удаление аккаунта ======
  async function handleConfirmDelete() {
    setError("");
    setMsg("");
    if (!deletePassword) {
      setError("Please enter your password to confirm account deletion.");
      return;
    }
    try {
      await deleteAccount(deletePassword);
      setMsg("Account deleted. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // ===== Рендер =====
  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading your profile...</p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="p-4 text-red-600">
        {error}
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="p-4 text-gray-500">
        No profile data
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Градиентная шапка */}
      <section
        className="
          w-full
          bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200
          text-center p-8
        "
      >
        <h2
          className="
            text-3xl font-semibold
            bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
            text-transparent bg-clip-text
            mb-2
          "
        >
          My Account
        </h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Welcome, {profile.username}! Manage your personal info and account here.
        </p>
      </section>

      {/* Плитки (3 штуки) */}
      <section
        className="
        max-w-6xl mx-auto
        px-4 py-10
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        gap-6
      "
      >
        {/* 1) Плитка - Name */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            bg-white dark:bg-gray-800
            rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
          onClick={handleOpenNameModal}
        >
          <h3
            className="
              text-xl font-semibold mb-2
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            "
          >
            Name
          </h3>
          <p className="text-gray-700 dark:text-gray-200 flex-1">
          {profile.username || ""} {profile.last_name || ""}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Click to update your first/last name
          </p>
        </motion.div>

        {/* 2) Плитка - Email */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            bg-white dark:bg-gray-800
            rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
          onClick={handleOpenEmailModal}
        >
          <h3
            className="
              text-xl font-semibold mb-2
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            "
          >
            Email
          </h3>
          <p className="text-gray-700 dark:text-gray-200 flex-1">
            {profile.email}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Click to change your email
          </p>
        </motion.div>

        {/* 3) Плитка - Delete Account */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            bg-white dark:bg-gray-800
            rounded-lg shadow p-6
            flex flex-col
            hover:shadow-lg transition-shadow
            cursor-pointer
          "
          onClick={handleOpenDeleteModal}
        >
          <h3
            className="
              text-xl font-semibold mb-2
              bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500
              text-transparent bg-clip-text
            "
          >
            Delete Account
          </h3>
          <p className="text-gray-700 dark:text-gray-200 flex-1">
            Permanently remove your data.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Click to proceed
          </p>
        </motion.div>
      </section>

      {/* Если нужно показать сообщение/ошибку глобально */}
      {(msg || error) && (
        <div className="text-center mb-4">
          {msg && <p className="text-green-600">{msg}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}

      {/* === Модалка: Edit Name === */}
      <Modal open={editNameOpen} onClose={() => setEditNameOpen(false)}>
        <h3 className="text-xl font-bold mb-4">Change Name</h3>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-semibold">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="
              w-full px-3 py-2 border rounded
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-semibold">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="
              w-full px-3 py-2 border rounded
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setEditNameOpen(false)}
            className="
              mr-2 px-4 py-2 rounded border
              text-gray-600 hover:bg-gray-100
            "
          >
            Cancel
          </button>
          <button
            onClick={handleSaveName}
            className="
              px-4 py-2 rounded
              bg-blue-600 text-white font-semibold
              hover:bg-blue-500
            "
          >
            Save
          </button>
        </div>
      </Modal>

      {/* === Модалка: Edit Email === */}
      <Modal open={editEmailOpen} onClose={() => setEditEmailOpen(false)}>
        <h3 className="text-xl font-bold mb-4">Change Email</h3>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-semibold">New Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="
              w-full px-3 py-2 border rounded
              focus:outline-none focus:ring-2 focus:ring-purple-500
            "
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setEditEmailOpen(false)}
            className="
              mr-2 px-4 py-2 rounded border
              text-gray-600 hover:bg-gray-100
            "
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEmail}
            className="
              px-4 py-2 rounded
              bg-purple-600 text-white font-semibold
              hover:bg-purple-500
            "
          >
            Save
          </button>
        </div>
      </Modal>

      {/* === Модалка: Delete Account === */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <h3 className="text-xl font-bold mb-4 text-red-600">Delete Account</h3>
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-200">
          Enter your password to confirm deletion:
        </p>
        <input
          type="password"
          className="
            w-full px-3 py-2 border rounded
            focus:outline-none focus:ring-2 focus:ring-red-500
          "
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setDeleteOpen(false)}
            className="
              mr-2 px-4 py-2 rounded border
              text-gray-600 hover:bg-gray-100
            "
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="
              px-4 py-2 rounded
              bg-red-600 text-white font-semibold
              hover:bg-red-500
            "
          >
            Delete
          </button>
        </div>
      </Modal>
    </main>
  );
}
