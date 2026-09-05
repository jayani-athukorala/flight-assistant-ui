import { Send } from "lucide-react";
import { type FormEvent, useState } from "react";

interface Props { disabled: boolean; onSubmit: (message: string) => void }

export default function AssistantComposer({ disabled, onSubmit }: Props) {
    const [value, setValue] = useState("");

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const message = value.trim();
        if (!message || disabled) return;
        onSubmit(message);
        setValue("");
    };

    return (
        <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
            <label htmlFor="assistant-message" className="sr-only">Message the flight assistant</label>
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <textarea
                    id="assistant-message"
                    rows={1}
                    value={value}
                    disabled={disabled}
                    maxLength={2000}
                    placeholder="Ask about flights or bookings…"
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                        }
                    }}
                    className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    aria-label="Send message"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Send aria-hidden size={18} />
                </button>
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-slate-400">Enter to send · Shift+Enter for a new line</p>
        </form>
    );
}
