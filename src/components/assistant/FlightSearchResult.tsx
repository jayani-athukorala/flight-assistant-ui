import { ArrowRight, CalendarDays, Clock3, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Flight } from "../../types/Flight";
import { formatDate, formatTime } from "../../utils/formatDate";

export default function FlightSearchResult({ flight }: { flight: Flight }) {
    const navigate = useNavigate();
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Plane size={16} /></span>
                    <div className="min-w-0"><p className="truncate text-xs text-slate-500">{flight.airline}</p><p className="text-sm font-bold text-slate-900">{flight.flightNumber}</p></div>
                </div>
                {flight.startingPrice != null && <span className="text-sm font-bold text-blue-700">{Number(flight.startingPrice).toLocaleString()} SEK</span>}
            </div>
            <div className="mt-3 flex items-center justify-between text-center">
                <div><p className="text-lg font-bold text-slate-900">{flight.origin.code}</p><p className="text-xs text-slate-500">{formatTime(flight.departureTime)}</p></div>
                <div className="flex flex-1 items-center px-3 text-slate-300"><span className="h-px flex-1 bg-slate-200"/><ArrowRight size={15}/><span className="h-px flex-1 bg-slate-200"/></div>
                <div><p className="text-lg font-bold text-slate-900">{flight.destination.code}</p><p className="text-xs text-slate-500">{formatTime(flight.arrivalTime)}</p></div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13}/>{formatDate(flight.departureTime)}</span>
                <span className="flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13}/>{flight.status}</span>
                <button type="button" onClick={() => navigate(`/booking/${flight.id}`, { state: { flight } })} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Select</button>
            </div>
        </article>
    );
}
