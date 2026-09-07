import {
    ArrowRight,
    CalendarDays,
    Clock3,
    LogIn,
    Plane,
    UserPlus,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import type { Flight } from "../../types/Flight";
import {
    formatDate,
    formatTime,
} from "../../utils/formatDate";

interface Props {
    flight: Flight;
    onSelect: (flight: Flight) => void;
}

export default function FlightSearchResult({
    flight,
    onSelect,
}: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const authenticationState = {
        from: {
            pathname: location.pathname,
            search: location.search,
        },
    };

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Plane size={16} aria-hidden />
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-xs text-slate-500">
                            {flight.airline}
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                            {flight.flightNumber}
                        </p>
                    </div>
                </div>

                {flight.startingPrice != null && (
                    <span className="shrink-0 text-sm font-bold text-blue-700">
                        {Number(
                            flight.startingPrice
                        ).toLocaleString()}{" "}
                        SEK
                    </span>
                )}
            </div>

            <div className="mt-3 flex items-center justify-between text-center">
                <div>
                    <p className="text-lg font-bold text-slate-900">
                        {flight.origin.code}
                    </p>

                    <p className="text-xs text-slate-500">
                        {formatTime(flight.departureTime)}
                    </p>
                </div>

                <div className="flex flex-1 items-center px-3 text-slate-300">
                    <span className="h-px flex-1 bg-slate-200" />
                    <ArrowRight size={15} aria-hidden />
                    <span className="h-px flex-1 bg-slate-200" />
                </div>

                <div>
                    <p className="text-lg font-bold text-slate-900">
                        {flight.destination.code}
                    </p>

                    <p className="text-xs text-slate-500">
                        {formatTime(flight.arrivalTime)}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays size={13} aria-hidden />
                    {formatDate(flight.departureTime)}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock3 size={13} aria-hidden />
                    {flight.status.replaceAll("_", " ")}
                </span>
            </div>

            {isAuthenticated ? (
                <button
                    type="button"
                    onClick={() => onSelect(flight)}
                    className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                    Book in chat
                </button>
            ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login", {
                                state: authenticationState,
                            })
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                        <LogIn size={14} aria-hidden />
                        Sign in to book
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/register", {
                                state: authenticationState,
                            })
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                        <UserPlus size={14} aria-hidden />
                        Create account
                    </button>
                </div>
            )}
        </article>
    );
}