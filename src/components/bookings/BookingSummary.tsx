import { Armchair, CalendarDays, ChevronLeft, Loader2, LockKeyhole, Plane, UserRound } from "lucide-react";
import type { Flight, FlightSeat } from "../../types/Flight";
import type { PassengerRequest, TripType } from "../../types/Booking";

interface BookingSummaryProps {
    outboundFlight: Flight;
    returnFlight?: Flight;
    tripType: TripType;
    passengers: PassengerRequest[];
    outboundSeats: FlightSeat[];
    returnSeats: FlightSeat[];
    onBack: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const money = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
});

const dateTime = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

const maskPassport = (value: string) =>
    value.length > 4 ? `•••• ${value.slice(-4)}` : value;

const BookingSummary = ({
    outboundFlight,
    returnFlight,
    tripType,
    passengers,
    outboundSeats,
    returnSeats,
    onBack,
    onConfirm,
    loading = false,
}: BookingSummaryProps) => {
    const findSeat = (seats: FlightSeat[], seatId: number | null) =>
        seats.find((seat) => seat.id === seatId);

    const outboundTotal = passengers.reduce(
        (sum, passenger) => sum + (findSeat(outboundSeats, passenger.outboundSeatId)?.price ?? 0),
        0
    );
    const returnTotal = tripType === "ROUND_TRIP"
        ? passengers.reduce(
            (sum, passenger) => sum + (findSeat(returnSeats, passenger.returnSeatId)?.price ?? 0),
            0
        )
        : 0;

    return (
        <section className="space-y-5">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    Final step
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Review your booking</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Confirm the flights, passenger details, and seats below.
                </p>
            </div>

            {[{ label: "Outbound", flight: outboundFlight, total: outboundTotal },
                ...(returnFlight ? [{ label: "Return", flight: returnFlight, total: returnTotal }] : [])
            ].map(({ label, flight, total }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                {label} flight
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <Plane size={18} className="text-blue-600" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    {flight.origin.code} → {flight.destination.code}
                                </h3>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                                {flight.airline} · {flight.flightNumber}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <CalendarDays size={15} />
                                {dateTime.format(new Date(flight.departureTime))}
                            </p>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{money.format(total)}</p>
                    </div>
                </div>
            ))}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="font-bold text-slate-900">Passengers and seats</h3>
                <div className="mt-4 divide-y divide-slate-100">
                    {passengers.map((passenger, index) => {
                        const outboundSeat = findSeat(outboundSeats, passenger.outboundSeatId);
                        const returnSeat = findSeat(returnSeats, passenger.returnSeatId);

                        return (
                            <div key={`${passenger.passportNumber}-${index}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                                        <UserRound size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {passenger.firstName} {passenger.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Passport {maskPassport(passenger.passportNumber)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                    <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
                                        <Armchair size={14} /> Outbound {outboundSeat?.seatNumber ?? "—"}
                                    </span>
                                    {tripType === "ROUND_TRIP" && (
                                        <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                                            <Armchair size={14} /> Return {returnSeat?.seatNumber ?? "—"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-400">Total booking price</p>
                        <p className="mt-1 text-3xl font-bold">{money.format(outboundTotal + returnTotal)}</p>
                    </div>
                    <p className="text-sm text-slate-400">
                        {passengers.length} {passengers.length === 1 ? "passenger" : "passengers"}
                    </p>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 disabled:opacity-50"
                >
                    <ChevronLeft size={18} /> Back
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <LockKeyhole size={18} />}
                    {loading ? "Confirming booking..." : "Confirm and book"}
                </button>
            </div>
        </section>
    );
};

export default BookingSummary;