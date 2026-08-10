import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import authService from "../../api/authService";
import axios from "axios";

interface LoginForm {
    email: string;
    password: string;
}

interface LocationState {
    from?: string;
}

interface ErrorResponse {
    message?: string;
}

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();

    const [formData, setFormData] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const locationState = location.state as LocationState | null;

    const from = locationState?.from || "/";

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await authService.login(formData);

            login(response);

            navigate(from, {
                replace: true,
            });
        } catch (error: unknown) {
            console.error(error);

            if (axios.isAxiosError<ErrorResponse>(error)) {
                setError(
                    error.response?.data?.message ||
                    "Invalid email or password."
                );
            } else {
                setError(
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50 px-4 py-10">

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Login
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Login to book flights and manage your bookings.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                            placeholder="john@test.com" required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input id="password" name="password" type="password" value={formData.password}
                            onChange={handleChange} placeholder="Enter your password" required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Footer */}
                <div className="mt-6 flex justify-center gap-1 text-sm text-gray-500">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register" state={{ from }} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        Register
                    </Link>

                </div>

            </div>
        </div>
    );
};

export default Login;