"use client";
import React, { useEffect } from "react";
import { useNotifications } from "@/context/NotificationsContext";

/** 
 * Простой компонент, который фиксированно показывает всплывашки в правом верхнем углу,
 * и автоматически скрывает каждое уведомление через 3 секунды.
 */
export default function Notifications() {
  const { notifications, removeNotification } = useNotifications();

  useEffect(() => {
    // Для каждого уведомления заведём таймер на 3 сек, затем remove.
    const timers = notifications.map(n => {
      const t = setTimeout(() => removeNotification(n.id), 3000);
      return t;
    });
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map(n => {
        let bgColor = "bg-blue-500";
        if(n.type==="error") bgColor = "bg-red-500";
        if(n.type==="success") bgColor = "bg-green-500";

        return (
          <div key={n.id}
               className={`p-3 rounded shadow text-white ${bgColor}`}
               style={{ minWidth: 200 }}
          >
            {n.message}
          </div>
        );
      })}
    </div>
  );
}
