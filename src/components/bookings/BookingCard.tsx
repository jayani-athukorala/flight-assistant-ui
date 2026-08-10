import Card from "../common/Card";
import CancelBookingButton from "./CancelBooking";

import { Plane, User, Mail, Ticket, Euro, Calendar, Armchair } from "lucide-react";

import type { Booking } from "../../types/Booking";

interface BookingCardProps {
    booking: Booking;
    refresh: () => void;
}

const BookingCard = ({ booking, refresh }: BookingCardProps) => {

    const passenger = booking.passengers[0];

    const statusStyles: Record<string, string> = {
        CONFIRMED: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    return (
        <Card>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Plane size={28} />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Flight
                            </p>

                            <h2 className="text-2xl font-bold text-slate-800">
                                {booking.outboundFlight.flightNumber}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {booking.outboundFlight.airline}
                            </p>

                        </div>

                    </div>

                    <span
                        className={`rounded-full px-4 py-1 text-sm font-semibold ${
                            statusStyles[booking.status] ??
                            "bg-slate-100 text-slate-700"
                        }`}
                    >
                        {booking.status}
                    </span>

                </div>

                {/* Route */}
                <div className="rounded-xl bg-blue-50 p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                From
                            </p>

                            <p className="text-lg font-semibold">
                                {booking.outboundFlight.origin}
                            </p>
                        </div>

                        <Plane className="text-blue-500" />

                        <div className="text-right">

                            <p className="text-xs uppercase text-slate-500">
                                To
                            </p>

                            <p className="text-lg font-semibold">
                                {booking.outboundFlight.destination}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="flex items-start gap-3">

                        <Calendar size={18} className="text-slate-500 mt-1" />

                        <div>

                            <p className="text-xs text-slate-500">
                                Departure
                            </p>

                            <p className="font-medium text-slate-800">
                                {new Date(
                                    booking.outboundFlight.departureTime
                                ).toLocaleString()}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-3">

                        <User size={18} className="text-slate-500 mt-1" />

                        <div>

                            <p className="text-xs text-slate-500">
                                Passenger
                            </p>

                            <p className="font-medium text-slate-800">
                                {passenger.firstName} {passenger.lastName}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-3">

                        <Mail size={18} className="text-slate-500 mt-1" />

                        <div>

                            <p className="text-xs text-slate-500">
                                Email
                            </p>

                            <p className="font-medium text-slate-800">
                                {passenger.email}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-3">

                        <Armchair size={18} className="text-slate-500 mt-1" />

                        <div>

                            <p className="text-xs text-slate-500">
                                Seat(s)
                            </p>

                            <p className="font-medium text-slate-800">
                                {booking.seats
                                    .map((seat) => seat.seatNumber)
                                    .join(", ")}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-3">

                        <Ticket size={18} className="text-slate-500 mt-1" />

                        <div>

                            <p className="text-xs text-slate-500">
                                Booking Reference
                            </p>

                            <p className="font-medium text-slate-800">
                                {booking.bookingReference}
                            </p>

                        </div>

                    </div>

                    <div className="flex items-start gap-3">

                        <Euro size={18} className="text-slate-500 mt-1" />

                        <div>

                            <p className="text-xs text-slate-500">
                                Total Price
                            </p>

                            <p className="text-xl font-bold text-green-700">
                                €{booking.totalPrice.toFixed(2)}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Return Flight */}
                {booking.returnFlight && (

                    <div className="rounded-xl border border-slate-200 p-4">

                        <p className="mb-2 text-sm font-semibold text-slate-700">
                            Return Flight
                        </p>

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="font-semibold">
                                    {booking.returnFlight.flightNumber}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {booking.returnFlight.origin} →{" "}
                                    {booking.returnFlight.destination}
                                </p>
                            </div>

                            <div className="text-right text-sm text-slate-500">

                                {new Date(
                                    booking.returnFlight.departureTime
                                ).toLocaleString()}

                            </div>

                        </div>

                    </div>

                )}

                {/* Footer */}

                <div className="flex justify-end border-t border-slate-200 pt-4">

                    {booking.status !== "CANCELLED" && (
                        <CancelBookingButton
                            bookingId={booking.id}
                            email={passenger.email}
                            onCancelled={refresh}
                        />
                    )}

                </div>

            </div>
        </Card>
    );
};

export default BookingCard;