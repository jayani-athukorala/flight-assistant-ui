import { type FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Plane } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
}

interface ErrorResponse {
    message?: string;
}

interface RegisterLocationState {
    from?: { pathname?: string; search?: string };
}

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as RegisterLocationState | null;
    const [form, setForm] = useState<RegisterForm>({ email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const passwordsMatch = form.confirmPassword === "" || form.password === form.confirmPassword;

    useEffect(() => {
        if (!success) return;
        const timeout = window.setTimeout(() => {
            navigate("/login", { state: { from: state?.from }, replace: true });
        }, 1200);
        return () => window.clearTimeout(timeout);
    }, [navigate, state?.from, success]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }
        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });
            setSuccess(true);
        } catch (caught: unknown) {
            const message = axios.isAxiosError<ErrorResponse>(caught)
                ? caught.response?.data?.message
                : undefined;
            setError(message ?? "Registration could not be completed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="grid min-h-[calc(100vh-72px)] bg-slate-50 lg:grid-cols-2">
            <section className="hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3"><span className="rounded-xl bg-white/15 p-3"><Plane size={24} /></span><span className="text-xl font-bold">SkyRoute Airways</span></div>
                <div className="max-w-lg">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Join SkyRoute</p>
                    <h1 className="mt-4 text-5xl font-bold leading-tight">Plan, book, and travel confidently.</h1>
                    <p className="mt-5 text-lg leading-8 text-blue-100">Create one account to manage passengers, seats, and every upcoming journey.</p>
                </div>
                <p className="text-sm text-blue-200">Your account is protected by secure authentication.</p>
            </section>

            <section className="flex items-center justify-center px-4 py-12 sm:px-8">
                <div className="w-full max-w-md">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Create account</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-950">Start your journey</h2>
                    <p className="mt-2 text-sm text-slate-500">Register to book flights and manage your trips.</p>

                    {error && <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="shrink-0" size={18} />{error}</div>}
                    {success && <div role="status" className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="shrink-0" size={18} />Account created. Redirecting to sign in...</div>}

                    <form onSubmit={submit} className="mt-7 space-y-5">
                        <div>
                            <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input id="register-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} autoComplete="email" required placeholder="name@example.com" className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                            </div>
                        </div>

                        <PasswordInput id="register-password" label="Password" value={form.password} visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} onChange={(password) => setForm((current) => ({ ...current, password }))} />
                        <PasswordInput id="confirm-password" label="Confirm password" value={form.confirmPassword} visible={showPassword} invalid={!passwordsMatch} onToggle={() => setShowPassword((visible) => !visible)} onChange={(confirmPassword) => setForm((current) => ({ ...current, confirmPassword }))} />

                        <p className="text-xs text-slate-500">Use at least 8 characters. A longer passphrase is recommended.</p>

                        <button type="submit" disabled={loading || success || !passwordsMatch} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-sm text-slate-500">Already registered?{" "}<Link to="/login" state={{ from: state?.from }} className="font-bold text-blue-700 hover:underline">Sign in</Link></p>
                </div>
            </section>
        </main>
    );
};

interface PasswordInputProps {
    id: string;
    label: string;
    value: string;
    visible: boolean;
    invalid?: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
}

const PasswordInput = ({ id, label, value, visible, invalid = false, onToggle, onChange }: PasswordInputProps) => (
    <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete="new-password" minLength={8} required className={`w-full rounded-xl border py-3 pl-10 pr-11 outline-none focus:ring-4 ${invalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`} />
            <button type="button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {invalid && <p className="mt-1 text-xs font-medium text-red-600">Passwords do not match.</p>}
    </div>
);

export default Register;
