import { useState } from "react";
import {
    Archive,
    Armchair,
    CalendarDays,
    Loader2,
    Plane,
    RotateCcw,
    Ticket,
    Undo2,
    Users,
} from "lucide-react";

import Card from "../common/Card";
import CancelBooking from "./CancelBooking";
import {
    archiveBooking,
    restoreBooking,
} from "../../services/bookingService";
import type { Booking } from "../../types/Booking";

interface BookingCardProps {
    booking: Booking;
    onChanged: () => void | Promise<void>;
}

type SecondaryAction = "archive" | "restore";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
});

const priceFormatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "SEK",
});

const statusStyles: Record<string, string> = {
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
    COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
};

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : dateFormatter.format(date);
};

const formatTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : timeFormatter.format(date);
};

interface FlightRowProps {
    label: string;
    flight: Booking["outboundFlight"];
    isReturn?: boolean;
}

const FlightRow = ({ label, flight, isReturn = false }: FlightRowProps) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                {isReturn ? (
                    <RotateCcw size={16} className="text-blue-600" />
                ) : (
                    <Plane size={16} className="text-blue-600" />
                )}
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {label}
                </p>
            </div>
            <p className="text-sm font-semibold text-slate-700">
                {flight.airline} · {flight.flightNumber}
            </p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
                <p className="text-xl font-bold text-slate-900">
                    {flight.origin.code}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    {flight.origin.city} · {formatDate(flight.departureTime)} ·{" "}
                    {formatTime(flight.departureTime)}
                </p>
            </div>

            <div className="flex items-center text-blue-400" aria-hidden="true">
                <span className="h-px w-5 bg-blue-200 sm:w-10" />
                <Plane size={15} className="mx-1" />
                <span className="h-px w-5 bg-blue-200 sm:w-10" />
            </div>

            <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                    {flight.destination.code}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    {flight.destination.city} · {formatDate(flight.arrivalTime)} ·{" "}
                    {formatTime(flight.arrivalTime)}
                </p>
            </div>
        </div>
    </div>
);

const BookingCard = ({ booking, onChanged }: BookingCardProps) => {
    const [action, setAction] = useState<SecondaryAction | null>(null);
    const [error, setError] = useState<string | null>(null);
    const archived = booking.archivedAt !== null;

    const performSecondaryAction = async (
        type: SecondaryAction,
        operation: () => Promise<void>,
        confirmation: string
    ) => {
        if (!window.confirm(confirmation)) return;

        setAction(type);
        setError(null);

        try {
            await operation();
            await onChanged();
        } catch {
            setError("The booking could not be updated. Please try again.");
        } finally {
            setAction(null);
        }
    };

    const seatFor = (passengerId: number, flightId: number) =>
        booking.seats.find(
            (assignment) =>
                assignment.passengerId === passengerId &&
                assignment.flightId === flightId
        );

    return (
        <Card>
            <article className={booking.status === "CANCELLED" ? "opacity-90" : ""}>
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                            <Ticket size={15} /> Booking reference
                        </p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                            {booking.bookingReference}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {booking.tripType === "ROUND_TRIP"
                                ? "Round trip"
                                : "One-way trip"}
                            {" · "}
                            {booking.passengers.length}{" "}
                            {booking.passengers.length === 1
                                ? "passenger"
                                : "passengers"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${
                                statusStyles[booking.status] ??
                                "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                        >
                            {booking.status}
                        </span>
                        <p className="text-lg font-bold text-slate-900">
                            {priceFormatter.format(booking.totalPrice)}
                        </p>
                    </div>
                </header>

                <div className="mt-5 space-y-3">
                    <FlightRow
                        label="Outbound flight"
                        flight={booking.outboundFlight}
                    />
                    {booking.returnFlight && (
                        <FlightRow
                            label="Return flight"
                            flight={booking.returnFlight}
                            isReturn
                        />
                    )}
                </div>

                <section className="mt-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Users size={17} className="text-slate-500" />
                        Passengers and seats
                    </h3>

                    <div className="space-y-2">
                        {booking.passengers.map((passenger) => {
                            const outboundSeat = seatFor(
                                passenger.id,
                                booking.outboundFlight.id
                            );
                            const returnSeat = booking.returnFlight
                                ? seatFor(passenger.id, booking.returnFlight.id)
                                : undefined;

                            return (
                                <div
                                    key={passenger.id}
                                    className="flex flex-col gap-2 rounded-xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {passenger.firstName} {passenger.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {passenger.email}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                        <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-700">
                                            <Armchair size={13} />
                                            Out {outboundSeat?.seatNumber ?? "—"}
                                        </span>
                                        {booking.returnFlight && (
                                            <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700">
                                                <Armchair size={13} />
                                                Return {returnSeat?.seatNumber ?? "—"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {booking.status === "CANCELLED" && (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                        This booking is cancelled. Its seats have been released for
                        other travellers.
                    </div>
                )}

                {error && (
                    <p
                        role="alert"
                        className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                    >
                        {error}
                    </p>
                )}

                <footer className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays size={14} />
                        Booked {formatDate(booking.bookingDate)}
                    </p>

                    {booking.status === "CONFIRMED" && !archived && (
                        <CancelBooking
                            bookingId={booking.id}
                            bookingReference={booking.bookingReference}
                            onCancelled={onChanged}
                        />
                    )}

                    {booking.status === "CANCELLED" && !archived && (
                        <button
                            type="button"
                            disabled={action !== null}
                            onClick={() =>
                                void performSecondaryAction(
                                    "archive",
                                    () => archiveBooking(booking.id),
                                    "Move this cancelled booking to your archive?"
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            {action === "archive" ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Archive size={16} />
                            )}
                            Archive booking
                        </button>
                    )}

                    {archived && (
                        <button
                            type="button"
                            disabled={action !== null}
                            onClick={() =>
                                void performSecondaryAction(
                                    "restore",
                                    () => restoreBooking(booking.id),
                                    "Restore this booking to your cancelled bookings list?"
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                            {action === "restore" ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Undo2 size={16} />
                            )}
                            Restore booking
                        </button>
                    )}
                </footer>
            </article>
        </Card>
    );
};

export default BookingCard;
