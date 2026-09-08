import { type FormEvent, useState } from "react";
import axios from "axios";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import authService from "../../services/authService";
import { useAuth } from "../../context/useAuth";

export type AuthFormMode = "login" | "register";

interface Props {
    mode: AuthFormMode;
    onSuccess: (completedMode: AuthFormMode) => void;
    compact?: boolean;
    loginAfterRegister?: boolean;
}

interface ApiError {
    message?: string;
}

export default function AuthForm({
    mode,
    onSuccess,
    compact = false,
    loginAfterRegister = false,
}: Props) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (mode === "register" && password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }
        if (mode === "register" && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const credentials = { email: email.trim().toLowerCase(), password };

        try {
            if (mode === "register") {
                await authService.register(credentials);
                if (!loginAfterRegister) {
                    onSuccess("register");
                    return;
                }
            }

            const response = await authService.login(credentials);
            login(response);
            onSuccess(mode);
        } catch (caught: unknown) {
            const message = axios.isAxiosError<ApiError>(caught)
                ? caught.response?.data?.message
                : undefined;
            setError(message ?? (mode === "login"
                ? "The email or password is incorrect."
                : "Registration could not be completed."));
        } finally {
            setLoading(false);
        }
    };

    const inputClass = compact
        ? "mt-1 w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        : "mt-1 w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

    return (
        <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-5"}>
            {error && (
                <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="shrink-0" size={18} /> {error}
                </div>
            )}

            <Field label="Email address" icon={<Mail size={17} />}>
                <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} />
            </Field>

            <Field label="Password" icon={<LockKeyhole size={17} />}>
                <input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
            </Field>

            {mode === "register" && (
                <Field label="Confirm password" icon={<LockKeyhole size={17} />}>
                    <input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
                </Field>
            )}

            <button type="submit" disabled={loading} className={`${compact ? "rounded-lg py-2.5 text-sm" : "rounded-xl py-3.5"} inline-flex w-full items-center justify-center gap-2 bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60`}>
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading
                    ? mode === "login" ? "Signing in..." : "Creating account..."
                    : mode === "login" ? "Sign in" : "Create account"}
            </button>
        </form>
    );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <label className="block text-sm font-semibold text-slate-700">
            {label}
            <span className="relative block">
                <span className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-slate-400">{icon}</span>
                {children}
            </span>
        </label>
    );
}
