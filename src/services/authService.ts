import api from "../api/axios";
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from "../types/Auth";

const login = async (
    credentials: LoginRequest
): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
        "/auth/login",
        credentials
    );

    return data;
};

const register = async (
    request: RegisterRequest
): Promise<void> => {
    await api.post(
        "/auth/register",
        request
    );
};

const authService = {
    login,
    register,
};

export default authService;