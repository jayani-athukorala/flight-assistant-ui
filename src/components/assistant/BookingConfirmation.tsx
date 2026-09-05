import { AlertTriangle, Check, X } from "lucide-react";
import type { PendingAssistantAction } from "../../types/Assistant";

interface Props {
    action: PendingAssistantAction;
    busy: boolean;
    onConfirm: () => void;
    onReject: () => void;
}

export default function BookingConfirmation({ action, busy, onConfirm, onReject }: Props) {
    const destructive = action.type === "CANCEL_BOOKING";
    return (
        <section className={`mt-3 rounded-xl border p-3 ${destructive ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`} aria-label="Action confirmation">
            <div className="flex gap-2">
                <AlertTriangle className={destructive ? "text-red-600" : "text-amber-600"} size={18} aria-hidden />
                <div><p className="text-sm font-bold text-slate-900">Confirm {destructive ? "cancellation" : "booking"}</p><p className="mt-1 text-xs leading-5 text-slate-600">{action.description}</p></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" disabled={busy} onClick={onReject} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"><X size={14}/>Not now</button>
                <button type="button" disabled={busy} onClick={onConfirm} className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}><Check size={14}/>Confirm</button>
            </div>
        </section>
    );
}
