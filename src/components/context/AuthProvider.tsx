import { useState, type ReactNode, } from "react";
import type { LoginResponse } from "../../api/authService";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

const AUTH_STORAGE_KEY = "auth";

export function AuthProvider({ children, }: AuthProviderProps) {
    const [user, setUser] = useState<LoginResponse | null>(() => {
            const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

            if (!storedUser) {
                return null;
            }

            try {
                return JSON.parse(
                    storedUser
                ) as LoginResponse;
            } catch {
                localStorage.removeItem(
                    AUTH_STORAGE_KEY
                );

                localStorage.removeItem("token");

                return null;
            }
        });

    const isAuthenticated = user !== null;

    const login = (response: LoginResponse) => {
        setUser(response);

        localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(response)
        );

        localStorage.setItem(
            "token",
            response.token
        );
    };

    const logout = () => {
        setUser(null);

        localStorage.removeItem(
            AUTH_STORAGE_KEY
        );

        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, }} >
            {children}
        </AuthContext.Provider>
    );
}