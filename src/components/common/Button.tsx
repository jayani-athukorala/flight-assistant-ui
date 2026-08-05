import type {
    ButtonHTMLAttributes,
    ReactNode
} from "react";

import clsx from "clsx";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "danger";
    fullWidth?: boolean;
}

const Button = ({ children, variant = "primary", fullWidth = false, className, ...props }: ButtonProps) => {

    return (
        <button
            {...props}
            className={clsx(` px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed`,

                {
                    "bg-blue-600 hover:bg-blue-700 text-white": variant === "primary",
                    "bg-slate-200 hover:bg-slate-300 text-slate-800": variant === "secondary",
                    "bg-red-600 hover:bg-red-700 text-white": variant === "danger",
                    "w-full": fullWidth
                }, className
            )} >
            {children}
        </button>
    );
};


export default Button;