"use client";

import { getHighestPriorityRole } from "@/lib/roles";
import { getUserByEmail } from "@/lib/user";
import { AuthResponse, User } from "@/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  activeRole: string | null;
  setActiveRole: (role: string | null) => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setAuthTokens: (authResponse: AuthResponse) => Promise<void>;
  removeAuthTokens: () => void;
  hasRole: (role: string) => boolean;
  isAdminOrManager: () => boolean;
  getAvailableRoles: () => string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const ACTIVE_ROLE_STORAGE_KEY = "activeRole";

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccess = localStorage.getItem("accessToken");
        const storedRefresh = localStorage.getItem("refreshToken");
        const storedUser = localStorage.getItem("user");
        const storedActiveRole = localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);

        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);

        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);

          // Always refresh user details to ensure we have the ID and latest info
          if (storedAccess && parsedUser.email) {
            try {
              const res = await getUserByEmail(parsedUser.email);
              setUser(res.data);
              localStorage.setItem("user", JSON.stringify(res.data));
            } catch (error) {
              console.error("AuthContext: Failed to refresh user details on init:", error);
            }
          }

          const roles = parsedUser.roles || [];
          if (roles.length > 0) {
            let initialActiveRole: string | null = null;
            if (storedActiveRole && roles.includes(storedActiveRole)) {
              initialActiveRole = storedActiveRole;
            } else {
              initialActiveRole = getHighestPriorityRole(roles);
            }
            setActiveRoleState(initialActiveRole);
          }
        }
      } catch (error) {
        console.error("Failed to load tokens from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuthTokens = async (authResponse: AuthResponse) => {
    const { accessToken, refreshToken, email } = authResponse;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    try {
      const userRes = await getUserByEmail(email);
      const userData = userRes.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      const nextActiveRole = getHighestPriorityRole(userData.roles);
      if (nextActiveRole) {
        localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, nextActiveRole);
        setActiveRoleState(nextActiveRole);
      } else {
        localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
        setActiveRoleState(null);
      }
    } catch (error) {
      console.error("Failed to fetch user details during login:", error);
      // Fallback to basic info if full fetch fails
      const fallbackUser: User = {
        email: authResponse.email,
        fullName: authResponse.fullName,
        roles: authResponse.roles,
      };
      setUser(fallbackUser);
      localStorage.setItem("user", JSON.stringify(fallbackUser));
    }
  };

  const removeAuthTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setActiveRoleState(null);
    router.push("/auth/login");
  };

  const hasRole = (role: string): boolean => user?.roles.includes(role) ?? false;
  const isAdminOrManager = (): boolean => hasRole("ADMIN") || hasRole("MANAGER");
  const getAvailableRoles = (): string[] => user?.roles ?? [];

  const setActiveRole = (role: string | null) => {
    const roles = user?.roles || [];
    if (!role || roles.length === 0) {
      localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
      setActiveRoleState(null);
      return;
    }
    const finalRole = roles.includes(role) ? role : getHighestPriorityRole(roles);
    if (finalRole) {
      localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, finalRole);
      setActiveRoleState(finalRole);
    } else {
      localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
      setActiveRoleState(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    if (!user?.email) return;
    try {
      const res = await getUserByEmail(user.email);
      updateUser(res.data);
    } catch (error) {
      console.error("AuthContext: Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!accessToken,
        isLoading,
        accessToken,
        refreshToken,
        user,
        activeRole,
        setAuthTokens,
        removeAuthTokens,
        hasRole,
        isAdminOrManager,
        getAvailableRoles,
        setActiveRole,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
