import { Bot, LogIn, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AssistantUiMessage } from "../../types/Assistant";
import AssistantError from "./AssistantError";
import BookingConfirmation from "./BookingConfirmation";
import FlightSearchResult from "./FlightSearchResult";

interface Props {
    item: AssistantUiMessage;
    busy: boolean;
    onConfirm: (actionId: string) => void;
    onReject: (actionId: string) => void;
    onRetry: (prompt: string) => void;
}

export default function AssistantMessage({ item, busy, onConfirm, onReject, onRetry }: Props) {
    const navigate = useNavigate();
    const assistant = item.role === "assistant";
    const data = item.response;

    return (
        <div className={`flex gap-2 ${assistant ? "justify-start" : "justify-end"}`}>
            {assistant && <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><Bot size={15}/></span>}
            <div className={`max-w-[88%] ${assistant ? "" : "order-first"}`}>
                {item.failedPrompt ? <AssistantError onRetry={() => onRetry(item.failedPrompt!)} /> : (
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${assistant ? "rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm" : "rounded-tr-sm bg-blue-600 text-white"}`}>
                        <p className="whitespace-pre-wrap">{item.text}</p>
                    </div>
                )}

                {data?.type === "AUTHENTICATION_REQUIRED" && (
                    <button type="button" onClick={() => navigate("/login")} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><LogIn size={14}/>Sign in</button>
                )}

                {data && data.airports.length > 0 && <div className="mt-2 grid gap-2">{data.airports.map((airport) => <div key={airport.id} className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm"><div className="flex justify-between"><strong className="text-sm text-slate-900">{airport.code}</strong><span>{airport.country}</span></div><p className="mt-1 font-medium text-slate-700">{airport.name}</p><p className="text-slate-500">{airport.city}</p></div>)}</div>}
                {data && data.flights.length > 0 && <div className="mt-2 grid gap-2">{data.flights.map((flight) => <FlightSearchResult key={flight.id} flight={flight}/>)}</div>}
                {data && data.availableSeats.length > 0 && <div className="mt-2 grid grid-cols-2 gap-2">{data.availableSeats.map((seat) => <div key={seat.id} className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-sm"><div className="flex justify-between"><strong className="text-slate-900">Seat {seat.seatNumber}</strong><span className="text-emerald-600">Available</span></div><p className="mt-1 text-slate-500">{seat.seatClass.replaceAll("_", " ")} · {Number(seat.price).toLocaleString()} SEK</p></div>)}</div>}
                {data && data.bookings.length > 0 && <div className="mt-2 grid gap-2">{data.bookings.map((booking) => <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm"><div className="flex justify-between gap-2"><strong className="text-sm text-slate-900">{booking.bookingReference}</strong><span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">{booking.status}</span></div><p className="mt-2 text-slate-600">{booking.outboundFlight.origin.code} → {booking.outboundFlight.destination.code}</p><p className="mt-1 font-semibold text-slate-900">{Number(booking.totalPrice).toLocaleString()} SEK</p></article>)}</div>}
                {data?.requiresConfirmation && data.pendingAction && <BookingConfirmation action={data.pendingAction} busy={busy} onConfirm={() => onConfirm(data.pendingAction!.actionId)} onReject={() => onReject(data.pendingAction!.actionId)}/>} 
            </div>
            {!assistant && <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600"><UserRound size={15}/></span>}
        </div>
    );
}
