import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
}

const Card = ({ children }: CardProps) => {
    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition">
            {children}
        </div>
    );
};

export default Card;