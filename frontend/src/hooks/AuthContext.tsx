import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, setGlobalLogout } from "./useAuth";
import type { AuthContextType, User } from "./useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true; // If we can't parse it, treat it as expired
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token on mount
    const validateToken = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        // First, check if token is expired by decoding it client-side
        if (isTokenExpired(storedToken)) {
          console.log("Token is expired, clearing auth data");
          throw new Error("Token expired");
        }

        // Token is valid, set auth state
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Token validation failed:", error);
        // Token is invalid or expired, clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (newToken: string, newUser: User, newRefreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  // Set global logout function for API interceptor
  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
