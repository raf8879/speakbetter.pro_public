

"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

/** Тип уведомления */
interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

/** Интерфейс контекста */
interface NotificationsContextData {
  notifications: Notification[];
  addNotification: (message: string, type: "success"|"error"|"info") => void;
  removeNotification: (id: string) => void;
}

/** Инициализация контекста */
const NotificationsContext = createContext<NotificationsContextData>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

/** Провайдер: оборачиваем всё приложение, чтобы иметь доступ к уведомлениям */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /** Функция добавляет уведомление */
  const addNotification = useCallback((message: string, type: "success"|"error"|"info") => {
    const newNotification: Notification = {
      id: uuidv4(),
      message,
      type,
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  /** Удаляем уведомление из массива */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
