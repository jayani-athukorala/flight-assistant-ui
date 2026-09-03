import axios from "axios";
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from "../types/Auth";

const API_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:8080/api";

const login = async (
    credentials: LoginRequest
): Promise<AuthResponse> => {
    const { data } = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        credentials
    );

    return data;
};

const register = async (
    request: RegisterRequest
): Promise<void> => {
    await axios.post(
        `${API_URL}/auth/register`,
        request
    );
};

const authService = {
    login,
    register,
};

export default authService;