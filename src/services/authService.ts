import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    role: string;
}

const login = async (
    credentials: LoginRequest
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
        `${API_URL}/login`,
        credentials
    );

    return response.data;
};

const register = async (
    data: RegisterRequest
): Promise<void> => {
    await axios.post(
        `${API_URL}/register`,
        data
    );
};

const authService = {
    login,
    register,
};

export default authService;