import { createContext } from "react";
import type { AuthResponse, AuthUser } from "../types/Auth";

export interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (response: AuthResponse) => void;
    logout: () => void;
}

export const AuthContext =
    createContext<AuthContextValue | undefined>(undefined);