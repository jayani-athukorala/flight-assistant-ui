import { CheckCircle, XCircle } from "lucide-react";

interface AlertProps {
    type: "success" | "error";
    message: string;
}

const Alert = ({
                   type,
                   message,
               }: AlertProps) => {
    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
                type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
            }`}
        >
            {type === "success" ? (
                <CheckCircle size={20} />
            ) : (
                <XCircle size={20} />
            )}

            <span>{message}</span>
        </div>
    );
};

export default Alert;