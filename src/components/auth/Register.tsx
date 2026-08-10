import { type ChangeEvent, type FormEvent, useState, } from "react";
import { Link, useLocation, useNavigate, } from "react-router-dom";

import axios from "axios";
import authService from "../../api/authService";

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
}

interface LocationState {
    from?: string;
}

interface ErrorResponse {
    message?: string;
}

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] =
        useState<RegisterForm>({
            email: "",
            password: "",
            confirmPassword: "",
        });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const locationState =
        location.state as LocationState | null;

    const from = locationState?.from || "/";

    const handleChange = (
        event: ChangeEvent<HTMLInputElement>
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
        setSuccess("");

        // Validate password length
        if (formData.password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        // Validate password confirmation
        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);

        try {
            // Only send email and password.
            // confirmPassword is NOT sent to the backend.
            await authService.register({
                email: formData.email,
                password: formData.password,
            });

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login", {
                    state: {
                        from,
                    },
                    replace: true,
                });
            }, 1000);

        } catch (error: unknown) {
            console.error(
                "Registration failed:",
                error
            );

            if (
                axios.isAxiosError<ErrorResponse>(
                    error
                )
            ) {
                setError(
                    error.response?.data?.message ??
                    "Registration failed. Please try again."
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
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Register to book flights and manage your bookings.
                    </p>

                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Success */}

                {success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
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
                            placeholder="john@test.com" autoComplete="email" required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input id="password" name="password" type="password" value={formData.password}
                            onChange={handleChange} placeholder="Create a password" autoComplete="new-password"
                            minLength={6} required className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                            Password must be at least 6 characters.
                        </p>

                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword}
                            onChange={handleChange} placeholder="Confirm your password" autoComplete="new-password"
                            minLength={6} required className={`w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-100 
                            ${ formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500" }`}
                        />

                        {/* Password mismatch message */}
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="mt-2 text-xs text-red-600">
                                    Passwords do not match.
                                </p>
                        )}

                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? "Creating account..." : "Register"}
                    </button>

                </form>

                {/* Footer */}
                <div className="mt-6 flex justify-center gap-1 text-sm text-gray-500">
                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login" state={{ from }}
                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
