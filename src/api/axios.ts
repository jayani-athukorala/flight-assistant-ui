import axios from "axios";

export const AUTH_TOKEN_KEY = "skyroute.auth.token";
export const AUTH_USER_KEY = "skyroute.auth.user";

const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

const api = axios.create({
    baseURL: apiUrl.replace(/\/+$/, ""),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            window.dispatchEvent(new Event("auth:logout"));
        }

        return Promise.reject(error);
    }
);

export default api;