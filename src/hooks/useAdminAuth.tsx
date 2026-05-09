"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "root" | "admin" | "employee";
  permissions: string[];
  mustChangePassword?: boolean;
}

interface AdminAuthContext {
  user: AdminUser | null;
  token: string | null;
  ready: boolean; // true once we've read localStorage on client
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRoot: boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  setAuthData: (user: AdminUser, token: string) => void;
}

const AuthContext = createContext<AdminAuthContext | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Single effect — runs once on client after mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("adminToken");
      const storedUser = localStorage.getItem("adminUser");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
    // Mark ready regardless — tells layout it can now make decisions
    setReady(true);
  }, []);

  const setAuthData = useCallback((newUser: AdminUser, newToken: string) => {
    localStorage.setItem("adminToken", newToken);
    localStorage.setItem("adminUser", JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setToken(null);
    router.push("/admin/login");
  }, [router]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (user.role === "root") return true;
      return user.permissions.includes(permission);
    },
    [user],
  );

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const currentToken = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${currentToken}`,
      };
      if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(url, { ...options, headers });

      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          localStorage.setItem("adminToken", accessToken);
          setToken(accessToken);
          return fetch(url, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${accessToken}` },
          });
        } else {
          logout();
          throw new Error("Session expired");
        }
      }
      return res;
    },
    [logout],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        logout,
        hasPermission,
        isRoot: user?.role === "root",
        fetchWithAuth,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
