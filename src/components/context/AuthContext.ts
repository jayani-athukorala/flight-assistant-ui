import { createContext } from "react";
import type { LoginResponse } from "../../api/authService";

export interface AuthContextType {
    isAuthenticated: boolean;
    user: LoginResponse | null;
    login: (response: LoginResponse) => void;
    logout: () => void;
}

export const AuthContext =
    createContext<AuthContextType | undefined>(undefined);
