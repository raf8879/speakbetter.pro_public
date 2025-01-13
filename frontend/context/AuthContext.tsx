"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, logoutUser } from "@/services/auth";
import { setOnLogoutCallback } from "@/services/api";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: number;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshProfile: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1) Пытаемся загрузить профиль при маунте
    refreshProfile();

    // 2) Настраиваем callback, который будет звать setUser(null)
    //    при провале refresh (doLogout).
    setOnLogoutCallback(() => {
      setUser(null);
      // При желании → router.push("/login");
    });
  }, []);

  // Подтягиваем профиль
  async function refreshProfile() {
    setIsLoading(true);
    try {
      const data = await fetchMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Явный logout
  async function logout() {
    try {
      await logoutUser();
    } catch (err) {
      // можно логировать
    }
    // Обнуляем user
    setUser(null);
    // Часто после логаута → router.push("/login");
  }

  const value = {
    user,
    isLoading,
    refreshProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
