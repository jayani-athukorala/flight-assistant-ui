import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input = ({label, ...props }: InputProps) => {
    return (
        <div className="space-y-2">
            <label className="block font-medium text-slate-700">
                {label}
            </label>

            <input
                {...props}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default Input;