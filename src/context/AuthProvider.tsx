import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContextDefinition";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../api/axios";
import type { AuthResponse, AuthUser, UserRole } from "../types/Auth";

interface AuthProviderProps {
    children: ReactNode;
}

const isRole = (value: unknown): value is UserRole =>
    value === "USER" || value === "ADMIN";

const readStoredUser = (): AuthUser | null => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored) as Partial<AuthUser>;
        return typeof parsed.email === "string" && isRole(parsed.role)
            ? { email: parsed.email, role: parsed.role }
            : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem(AUTH_TOKEN_KEY)
    );
    const [user, setUser] = useState<AuthUser | null>(readStoredUser);
    const [isInitializing, setIsInitializing] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);

        setToken(null);
        setUser(null);

        window.dispatchEvent(
            new Event("auth:identity-changed")
        );
    }, []);

    const login = useCallback((response: AuthResponse) => {
        const authenticatedUser: AuthUser = {
            email: response.email,
            role: response.role,
        };

        localStorage.setItem(
            AUTH_TOKEN_KEY,
            response.token
        );

        localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(authenticatedUser)
        );

        setToken(response.token);
        setUser(authenticatedUser);

        /*
        * Anonymous conversations must not be reused after login.
        */
        window.dispatchEvent(
            new Event("auth:identity-changed")
        );
    }, []);

    useEffect(() => {
        if (!token || !user) logout();
        setIsInitializing(false);
    }, [logout, token, user]);

    useEffect(() => {
        window.addEventListener("auth:logout", logout);
        return () => window.removeEventListener("auth:logout", logout);
    }, [logout]);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(token && user),
            isInitializing,
            login,
            logout,
        }),
        [isInitializing, login, logout, token, user]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
