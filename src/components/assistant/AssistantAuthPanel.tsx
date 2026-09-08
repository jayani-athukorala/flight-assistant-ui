import AuthForm, { type AuthFormMode } from "../auth/AuthForm";

interface Props {
    mode: AuthFormMode;
    onModeChange: (mode: AuthFormMode) => void;
    onSuccess: () => void;
    onClose: () => void;
}

export default function AssistantAuthPanel({ mode, onModeChange, onSuccess, onClose }: Props) {
    return (
        <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-slate-900">
                {mode === "login" ? "Sign in here" : "Create your account"}
            </h3>
            <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
                Complete the login below and your previous task will continue automatically.
            </p>
            <AuthForm key={mode} mode={mode} compact loginAfterRegister onSuccess={onSuccess} />
            <div className="mt-3 flex items-center justify-between text-xs">
                <button type="button" onClick={() => onModeChange(mode === "login" ? "register" : "login")} className="font-semibold text-blue-700 hover:underline">
                    {mode === "login" ? "Create an account" : "Already registered? Sign in"}
                </button>
                <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800">Close</button>
            </div>
        </section>
    );
}
