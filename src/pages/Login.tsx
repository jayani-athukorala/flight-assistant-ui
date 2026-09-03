import { type FormEvent, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail, Plane } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";
import { useAuth } from "../context/useAuth";

interface LoginForm {
    email: string;
    password: string;
}

interface ErrorResponse {
    message?: string;
}

interface LoginLocationState {
    from?: {
        pathname?: string;
        search?: string;
    };
}

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const state = location.state as LoginLocationState | null;
    const destination = state?.from
        ? `${state.from.pathname ?? "/"}${state.from.search ?? ""}`
        : "/";

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login({
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });
            login(response);
            navigate(destination, { replace: true });
        } catch (caught: unknown) {
            const message = axios.isAxiosError<ErrorResponse>(caught)
                ? caught.response?.data?.message
                : undefined;
            setError(message ?? "The email or password is incorrect.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="grid min-h-[calc(100vh-72px)] bg-slate-50 lg:grid-cols-2">
            <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-blue-600 p-3"><Plane size={24} /></span>
                    <span className="text-xl font-bold">SkyRoute Airways</span>
                </div>
                <div className="max-w-lg">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Travel made simple</p>
                    <h1 className="mt-4 text-5xl font-bold leading-tight">Your journey starts here.</h1>
                    <p className="mt-5 text-lg leading-8 text-slate-300">Sign in to select seats, manage bookings, and keep every trip in one place.</p>
                </div>
                <p className="text-sm text-slate-500">Secure authentication · Protected bookings</p>
            </section>

            <section className="flex items-center justify-center px-4 py-12 sm:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <div className="flex items-center gap-2 text-blue-700"><Plane size={22} /><strong>SkyRoute Airways</strong></div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-950">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-slate-500">Manage your flights and bookings securely.</p>

                    {error && (
                        <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle className="shrink-0" size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-7 space-y-5">
                        <AuthInput
                            id="email"
                            label="Email address"
                            type="email"
                            value={form.email}
                            placeholder="name@example.com"
                            icon={Mail}
                            autoComplete="email"
                            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                        />

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                    autoComplete="current-password"
                                    required
                                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-11 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-sm text-slate-500">
                        New to SkyRoute?{" "}
                        <Link to="/register" state={{ from: state?.from }} className="font-bold text-blue-700 hover:underline">Create an account</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

interface AuthInputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    placeholder: string;
    icon: typeof Mail;
    autoComplete: string;
    onChange: (value: string) => void;
}

const AuthInput = ({ id, label, icon: Icon, onChange, ...props }: AuthInputProps) => (
    <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input id={id} {...props} onChange={(event) => onChange(event.target.value)} required className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </div>
    </div>
);

export default Login;
