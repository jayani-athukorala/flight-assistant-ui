import { useRef, useState } from "react";
import { Bot, CalendarDays, LogIn, Plane, Trash2 } from "lucide-react";
import type { AssistantUiMessage } from "../../types/Assistant";
import type { Flight } from "../../types/Flight";
import type { Airport } from "../../types/Airport";
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
    onChangeFlightDate: (origin: Airport, destination: Airport, date: string) => void;
    onCreateBooking: () => void;
}

export default function AssistantMessage({
    item,
    busy,
    onSelectFlight,
    onRetry,
    onBookingChanged,
    onAuthenticate,
    onChangeFlightDate,
    onCreateBooking,
}: Props) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [flightDate, setFlightDate] = useState("");
    const bookingResultsRef = useRef<HTMLDivElement>(null);
    const assistant = item.role === "assistant";
    const data = item.response;
    const displayedText = assistant
        ? formatAssistantText(item.text, data)
        : item.text;

    const showAirportResults =
        Boolean(data?.airports.length) && !data?.flights.length;

    const focusFirstCancelButton = () => {
        const cancelButton = Array.from(
            bookingResultsRef.current?.querySelectorAll("button") ?? []
        ).find((button) => button.textContent?.trim().includes("Cancel booking"));

        cancelButton?.scrollIntoView({ behavior: "smooth", block: "center" });
        cancelButton?.focus();
    };

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
                <div className="space-y-3">
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

                    <button
                        type="button"
                        onClick={() => {
                            setShowDatePicker((visible) => !visible);
                            if (!flightDate) {
                                setFlightDate(data.flights[0].departureTime.split("T")[0]);
                            }
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                        <CalendarDays size={14} aria-hidden /> Change date
                    </button>

                    {showDatePicker && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                            <label className="text-xs font-semibold text-slate-700">
                                Select another departure date
                                <input
                                    type="date"
                                    value={flightDate}
                                    onChange={(event) => setFlightDate(event.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </label>
                            <button
                                type="button"
                                disabled={!flightDate || busy}
                                onClick={() => onChangeFlightDate(
                                    data.flights[0].origin,
                                    data.flights[0].destination,
                                    flightDate
                                )}
                                className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Search this date
                            </button>
                        </div>
                    )}
                </div>
            )}

            {data && data.bookings.length > 0 && (
                <div ref={bookingResultsRef} className="space-y-3">
                    <div className="grid gap-3">
                        {data.bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onChanged={onBookingChanged}
                            />
                        ))}
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="text-xs font-medium text-blue-900">
                            What would you like to do next?
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onCreateBooking}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                            <Plane size={14} /> Create new booking
                        </button>
                        <button
                            type="button"
                            onClick={focusFirstCancelButton}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                            <Trash2 size={14} /> Cancel a booking
                        </button>
                        </div>
                    </div>
                </div>
            )}

            {busy && data?.flights.length ? (
                <p className="text-center text-xs text-slate-400">Updating…</p>
            ) : null}
        </div>
    );
}
