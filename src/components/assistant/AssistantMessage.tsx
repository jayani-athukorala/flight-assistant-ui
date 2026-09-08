import { Bot, LogIn } from "lucide-react";
import type { AssistantUiMessage } from "../../types/Assistant";
import type { Flight } from "../../types/Flight";
import { formatAssistantText } from "../../utils/formatAssistantText";
import AssistantError from "./AssistantError";
import FlightCard from "../flights/FlightCard";
import BookingCard from "../bookings/BookingCard";

interface Props {
    item: AssistantUiMessage;
    busy: boolean;
    onSelectFlight: (flight: Flight) => void;
    onRetry: (prompt: string) => void;
    onBookingChanged: () => void;
    onAuthenticate: (mode: "login" | "register") => void;
}

export default function AssistantMessage({
    item,
    busy,
    onSelectFlight,
    onRetry,
    onBookingChanged,
    onAuthenticate,
}: Props) {
    const assistant = item.role === "assistant";
    const data = item.response;
    const displayedText = assistant
        ? formatAssistantText(item.text, data)
        : item.text;

    const showAirportResults =
        Boolean(data?.airports.length) && !data?.flights.length;

    return (
        <div className="space-y-2">
            <div className={`flex gap-2 ${assistant ? "justify-start" : "justify-end"}`}>
                {assistant && (
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Bot size={15} aria-hidden />
                    </span>
                )}

                <div className={`max-w-[88%] ${assistant ? "" : "order-first"}`}>
                    {item.failedPrompt ? (
                        <AssistantError onRetry={() => onRetry(item.failedPrompt!)} />
                    ) : displayedText ? (
                        <div
                            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                                assistant
                                    ? "rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm"
                                    : "rounded-tr-sm bg-blue-600 text-white"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{displayedText}</p>
                        </div>
                    ) : null}

                    {(data?.type === "AUTHENTICATION_REQUIRED" || item.authenticationRequired) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => onAuthenticate("login")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                                <LogIn size={14} aria-hidden />
                                Sign in
                            </button>
                            <button
                                type="button"
                                onClick={() => onAuthenticate("register")}
                                className="inline-flex items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                                Create account
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showAirportResults && data && (
                <div className="grid gap-2 pl-9">
                    {data.airports.map((airport) => (
                        <article
                            key={airport.id}
                            className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm"
                        >
                            <div className="flex justify-between gap-2">
                                <strong className="text-sm text-slate-900">{airport.code}</strong>
                                <span className="text-slate-500">{airport.country}</span>
                            </div>
                            <p className="mt-1 font-medium text-slate-700">{airport.name}</p>
                            <p className="text-slate-500">{airport.city}</p>
                        </article>
                    ))}
                </div>
            )}

            {data && data.flights.length > 0 && (
                <div className="grid gap-3">
                    {data.flights.map((flight) => (
                        <FlightCard
                            key={flight.id}
                            flight={flight}
                            onSelect={() => onSelectFlight(flight)}
                            actionLabel="Select flight"
                        />
                    ))}
                </div>
            )}

            {data && data.bookings.length > 0 && (
                <div className="grid gap-3">
                    {data.bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onChanged={onBookingChanged}
                        />
                    ))}
                </div>
            )}

            {busy && data?.flights.length ? (
                <p className="text-center text-xs text-slate-400">Updating…</p>
            ) : null}
        </div>
    );
}
