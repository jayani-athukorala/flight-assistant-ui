import { MessageCircle, X } from "lucide-react";

interface Props { open: boolean; onClick: () => void }

export default function AssistantButton({ open, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={open ? "Close flight assistant" : "Open flight assistant"}
            aria-expanded={open}
            aria-controls="flight-assistant-panel"
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-300/50 transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:bottom-7 sm:right-7"
        >
            {open ? <X aria-hidden size={24} /> : <MessageCircle aria-hidden size={25} />}
        </button>
    );
}
