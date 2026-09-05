import { RefreshCw } from "lucide-react";

export default function AssistantError({ onRetry }: { onRetry?: () => void }) {
    return (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p>I couldn’t contact the flight assistant. Please try again.</p>
            {onRetry && <button type="button" onClick={onRetry} className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"><RefreshCw size={13}/>Retry</button>}
        </div>
    );
}
