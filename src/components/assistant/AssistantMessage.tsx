import {
    Bot,
    ChevronDown,
    ChevronUp,
    LogIn,
    UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AssistantUiMessage } from "../../types/Assistant";
import type { Flight } from "../../types/Flight";
import { formatAssistantText } from "../../utils/formatAssistantText";
import AssistantError from "./AssistantError";
import BookingConfirmation from "./BookingConfirmation";
import FlightSearchResult from "./FlightSearchResult";

interface Props {
    item: AssistantUiMessage;
    busy: boolean;
    onSend: (message: string) => void;
    onConfirm: (actionId: string) => void;
    onReject: (actionId: string) => void;
    onRetry: (prompt: string) => void;
}

interface FlightResultsProps {
    flights: Flight[];
    onSelect: (flight: Flight) => void;
}

function FlightResults({
    flights,
    onSelect,
}: FlightResultsProps) {
    const [visibleCount, setVisibleCount] = useState(10);

    const sortedFlights = useMemo(
        () =>
            [...flights].sort(
                (first, second) =>
                    new Date(first.departureTime).getTime() -
                    new Date(second.departureTime).getTime()
            ),
        [flights]
    );

    if (sortedFlights.length === 0) {
        return null;
    }

    const visibleFlights =
        sortedFlights.slice(0, visibleCount);

    const hasMore =
        visibleCount < sortedFlights.length;

    return (
        <div className="mt-2 space-y-2">
            <p className="px-1 text-xs font-medium text-slate-500">
                Showing {visibleFlights.length} of{" "}
                {sortedFlights.length} flights
            </p>

            <div className="grid gap-2">
                {visibleFlights.map((flight) => (
                    <FlightSearchResult
                        key={flight.id}
                        flight={flight}
                        onSelect={onSelect}
                    />
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    onClick={() =>
                        setVisibleCount((current) =>
                            Math.min(
                                current + 10,
                                sortedFlights.length
                            )
                        )
                    }
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                    <ChevronDown
                        size={15}
                        aria-hidden
                    />
                    Show more flights
                </button>
            )}

            {visibleCount > 10 && (
                <button
                    type="button"
                    onClick={() => setVisibleCount(10)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
                >
                    <ChevronUp
                        size={15}
                        aria-hidden
                    />
                    Show fewer
                </button>
            )}
        </div>
    );
}

export default function AssistantMessage({
    item,
    busy,
    onSend,
    onConfirm,
    onReject,
    onRetry,
}: Props) {
    const navigate = useNavigate();
    const assistant = item.role === "assistant";
    const data = item.response;

    const displayedText = assistant
        ? formatAssistantText(item.text, data)
        : item.text;

    /*
     * Airport cards are hidden when flight results exist,
     * because the flight cards already show both airports.
     */
    const showAirportResults =
        Boolean(data?.airports.length) &&
        !data?.flights.length;

    const selectFlight = (flight: Flight) => {
        const departureDate =
            flight.departureTime.split("T")[0];

        onSend(
            `Show available seats for flight ID ${flight.id}: ` +
            `${flight.flightNumber} from ${flight.origin.code} to ` +
            `${flight.destination.code} on ${departureDate}. ` +
            `I would like to continue booking this flight.`
        );
    };

    return (
        <div
            className={`flex gap-2 ${
                assistant
                    ? "justify-start"
                    : "justify-end"
            }`}
        >
            {assistant && (
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Bot size={15} aria-hidden />
                </span>
            )}

            <div
                className={`max-w-[88%] ${
                    assistant ? "" : "order-first"
                }`}
            >
                {item.failedPrompt ? (
                    <AssistantError
                        onRetry={() =>
                            onRetry(item.failedPrompt!)
                        }
                    />
                ) : displayedText ? (
                    <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                            assistant
                                ? "rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm"
                                : "rounded-tr-sm bg-blue-600 text-white"
                        }`}
                    >
                        <p className="whitespace-pre-wrap">
                            {displayedText}
                        </p>
                    </div>
                ) : null}

                {data?.type ===
                    "AUTHENTICATION_REQUIRED" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                            <LogIn
                                size={14}
                                aria-hidden
                            />
                            Sign in
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                            className="inline-flex items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                            Create account
                        </button>
                    </div>
                )}

                {showAirportResults && data && (
                    <div className="mt-2 grid gap-2">
                        {data.airports.map((airport) => (
                            <article
                                key={airport.id}
                                className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm"
                            >
                                <div className="flex justify-between gap-2">
                                    <strong className="text-sm text-slate-900">
                                        {airport.code}
                                    </strong>

                                    <span className="text-slate-500">
                                        {airport.country}
                                    </span>
                                </div>

                                <p className="mt-1 font-medium text-slate-700">
                                    {airport.name}
                                </p>

                                <p className="text-slate-500">
                                    {airport.city}
                                </p>
                            </article>
                        ))}
                    </div>
                )}

                {data && (
                    <FlightResults
                        flights={data.flights}
                        onSelect={selectFlight}
                    />
                )}

                {data &&
                    data.availableSeats.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {data.availableSeats.map(
                            (seat) => (
                                <article
                                    key={seat.id}
                                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-sm"
                                >
                                    <div className="flex justify-between gap-2">
                                        <strong className="text-slate-900">
                                            Seat{" "}
                                            {
                                                seat.seatNumber
                                            }
                                        </strong>

                                        <span className="text-emerald-600">
                                            Available
                                        </span>
                                    </div>

                                    <p className="mt-1 text-slate-500">
                                        {seat.seatClass.replaceAll(
                                            "_",
                                            " "
                                        )}{" "}
                                        ·{" "}
                                        {Number(
                                            seat.price
                                        ).toLocaleString()}{" "}
                                        SEK
                                    </p>
                                </article>
                            )
                        )}
                    </div>
                )}

                {data &&
                    data.bookings.length > 0 && (
                    <div className="mt-2 grid gap-2">
                        {data.bookings.map(
                            (booking) => (
                                <article
                                    key={booking.id}
                                    className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm"
                                >
                                    <div className="flex justify-between gap-2">
                                        <strong className="text-sm text-slate-900">
                                            {
                                                booking.bookingReference
                                            }
                                        </strong>

                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                                            {
                                                booking.status
                                            }
                                        </span>
                                    </div>

                                    <p className="mt-2 text-slate-600">
                                        {
                                            booking
                                                .outboundFlight
                                                .origin.code
                                        }{" "}
                                        →{" "}
                                        {
                                            booking
                                                .outboundFlight
                                                .destination
                                                .code
                                        }
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {Number(
                                            booking.totalPrice
                                        ).toLocaleString()}{" "}
                                        SEK
                                    </p>
                                </article>
                            )
                        )}
                    </div>
                )}

                {data?.requiresConfirmation &&
                    data.pendingAction && (
                        <BookingConfirmation
                            action={
                                data.pendingAction
                            }
                            busy={busy}
                            onConfirm={() =>
                                onConfirm(
                                    data
                                        .pendingAction!
                                        .actionId
                                )
                            }
                            onReject={() =>
                                onReject(
                                    data
                                        .pendingAction!
                                        .actionId
                                )
                            }
                        />
                    )}
            </div>

            {!assistant && (
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                    <UserRound
                        size={15}
                        aria-hidden
                    />
                </span>
            )}
        </div>
    );
}