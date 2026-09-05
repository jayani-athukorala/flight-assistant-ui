import { Bot, Eraser, LoaderCircle, Minus } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AssistantUiMessage } from "../../types/Assistant";
import AssistantComposer from "./AssistantComposer";
import AssistantMessage from "./AssistantMessage";

interface Props {
    messages: AssistantUiMessage[];
    loading: boolean;
    onClose: () => void;
    onClear: () => void;
    onSend: (message: string) => void;
    onConfirm: (actionId: string) => void;
    onReject: (actionId: string) => void;
}

export default function AssistantPanel(props: Props) {
    const bottom = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: "smooth" });
    }, [props.loading, props.messages]);

    return (
        <section id="flight-assistant-panel" role="dialog" aria-label="Flight assistant" className="fixed inset-x-3 bottom-22 z-50 flex h-[min(680px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-7 sm:w-[410px]">
            <header className="flex items-center justify-between bg-slate-950 px-4 py-3.5 text-white">
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600"><Bot size={19}/></span><div><h2 className="text-sm font-bold">SkyRoute Assistant</h2><p className="flex items-center gap-1.5 text-[11px] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Ready to help</p></div></div>
                <div className="flex gap-1">
                    <button type="button" onClick={props.onClear} aria-label="Clear conversation" title="Clear conversation" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"><Eraser size={17}/></button>
                    <button type="button" onClick={props.onClose} aria-label="Minimize assistant" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"><Minus size={18}/></button>
                </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite" aria-busy={props.loading}>
                {props.messages.length === 0 && (
                    <div className="mx-auto mt-10 max-w-xs text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Bot size={23}/></span><h3 className="mt-4 font-bold text-slate-900">Where would you like to go?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Search flights and seats. Sign in to view, create, or cancel your bookings.</p><div className="mt-4 flex flex-wrap justify-center gap-2">{["Find flights to Paris", "Show airports in Gothenburg", "Show my bookings"].map((prompt) => <button key={prompt} type="button" onClick={() => props.onSend(prompt)} className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">{prompt}</button>)}</div></div>
                )}
                {props.messages.map((message) => <AssistantMessage key={message.id} item={message} busy={props.loading} onConfirm={props.onConfirm} onReject={props.onReject} onRetry={props.onSend}/>)}
                {props.loading && <div className="flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="animate-spin text-blue-600" size={17}/><span>Assistant is thinking…</span></div>}
                <div ref={bottom}/>
            </div>
            <AssistantComposer disabled={props.loading} onSubmit={props.onSend}/>
        </section>
    );
}
