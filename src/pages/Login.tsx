import { Plane } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";

interface LoginLocationState {
    from?: {
        pathname?: string;
        search?: string;
    };
}

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LoginLocationState | null;
    const destination = state?.from
        ? `${state.from.pathname ?? "/"}${state.from.search ?? ""}`
        : "/";

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

                    <div className="mt-7">
                        <AuthForm mode="login" onSuccess={() => navigate(destination, { replace: true })} />
                    </div>

                    <p className="mt-7 text-center text-sm text-slate-500">
                        New to SkyRoute?{" "}
                        <Link to="/register" state={{ from: state?.from }} className="font-bold text-blue-700 hover:underline">Create an account</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;
