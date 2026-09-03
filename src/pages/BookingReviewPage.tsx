import { useMemo } from "react";
import type { BookingRequest, TripType } from "../types/Booking";
import type { Flight, FlightSeat } from "../types/Flight";

interface BookingReviewPageProps {
    flight: Flight;
    returnFlight?: Flight;
    tripType: TripType;
    seats: FlightSeat[];
    booking: BookingRequest;
    onBack: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const routeLabel = (flight: Flight): string =>
    `${flight.origin.city} (${flight.origin.code}) → ${flight.destination.city} (${flight.destination.code})`;

const BookingReviewPage = ({
                               flight,
                               returnFlight,
                               tripType,
                               seats,
                               booking,
                               onBack,
                               onConfirm,
                               loading = false,
                           }: BookingReviewPageProps) => {
    const total = useMemo(
        () =>
            seats.reduce((sum, seat) => {
                const price = Number(seat.price);
                return Number.isFinite(price) ? sum + price : sum;
            }, 0),
        [seats]
    );

    const seatNumberById = useMemo(
        () => new Map(seats.map((seat) => [seat.id, seat.seatNumber])),
        [seats]
    );

    const outboundSeats = booking.passengers
        .map((passenger) => passenger.outboundSeatId)
        .filter((id) => id > 0)
        .map((id) => seatNumberById.get(id) ?? `#${id}`);

    const returnSeats = booking.passengers
        .map((passenger) => passenger.returnSeatId)
        .filter((id): id is number => id !== null && id > 0)
        .map((id) => seatNumberById.get(id) ?? `#${id}`);

    const passengerCount = booking.passengers.length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Review your booking
                </h2>
                <p className="mt-1 text-slate-500">
                    Check everything before confirming.
                </p>
            </div>

            <section className="rounded-2xl border bg-white p-6">
                <h3 className="font-bold">Flights</h3>

                <div className="mt-4">
                    <p className="font-semibold">{flight.flightNumber}</p>
                    <p className="text-slate-500">{routeLabel(flight)}</p>
                </div>

                {tripType === "ROUND_TRIP" && returnFlight && (
                    <div className="mt-5 border-t pt-5">
                        <p className="font-semibold">
                            {returnFlight.flightNumber}
                        </p>
                        <p className="text-slate-500">
                            {routeLabel(returnFlight)}
                        </p>
                    </div>
                )}
            </section>

            <section className="rounded-2xl border bg-white p-6">
                <h3 className="font-bold">Passengers</h3>
                <p className="mt-2 text-slate-500">
                    {passengerCount} adult{passengerCount !== 1 ? "s" : ""}
                </p>

                <div className="mt-4 space-y-3">
                    {booking.passengers.map((passenger, index) => (
                        <div
                            key={`${passenger.passportNumber}-${index}`}
                            className="rounded-xl bg-slate-50 p-4"
                        >
                            <p className="font-semibold">
                                {passenger.firstName} {passenger.lastName}
                            </p>
                            <p className="text-sm text-slate-500">
                                Passport: {passenger.passportNumber}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border bg-white p-6">
                <h3 className="font-bold">Selected seats</h3>
                <p className="mt-3 text-slate-600">
                    Outbound: {outboundSeats.join(", ") || "Not selected"}
                </p>

                {tripType === "ROUND_TRIP" && (
                    <p className="mt-2 text-slate-600">
                        Return: {returnSeats.join(", ") || "Not selected"}
                    </p>
                )}
            </section>

            <section className="rounded-2xl border bg-white p-6">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat("en-IE", {
                            style: "currency",
                            currency: "EUR",
                        }).format(total)}
                    </span>
                </div>
            </section>

            <div className="flex justify-between gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="rounded-xl border px-6 py-3 font-semibold disabled:opacity-50"
                >
                    ← Back
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Booking..." : "Confirm booking"}
                </button>
            </div>
        </div>
    );
};

export default BookingReviewPage;
