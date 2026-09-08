import { useEffect, useState } from "react";
import { CheckCircle2, Plane } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";

interface RegisterLocationState {
    from?: { pathname?: string; search?: string };
}

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as RegisterLocationState | null;
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!success) return;
        const timeout = window.setTimeout(() => {
            navigate("/login", { state: { from: state?.from }, replace: true });
        }, 1200);
        return () => window.clearTimeout(timeout);
    }, [navigate, state?.from, success]);

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

                    {success && <div role="status" className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="shrink-0" size={18} />Account created. Redirecting to sign in...</div>}
                    {!success && <div className="mt-7"><AuthForm mode="register" onSuccess={() => setSuccess(true)} /></div>}

                    <p className="mt-7 text-center text-sm text-slate-500">Already registered?{" "}<Link to="/login" state={{ from: state?.from }} className="font-bold text-blue-700 hover:underline">Sign in</Link></p>
                </div>
            </section>
        </main>
    );
};

export default Register;
