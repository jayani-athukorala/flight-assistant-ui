import type { Flight } from "../../types/Flight";
import { useAuth } from "../context/useAuth";
import Button from "../common/Button";

import { useNavigate } from "react-router-dom";
import { formatDate, formatTime, } from "../../utils/formatDate";

interface FlightCardProps {
    flight: Flight;
}

export default function FlightCard({
                                       flight,
                                   }: FlightCardProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleBookFlight = () => {
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/booking/${flight.id}`,
                },
            });
            return;
        }

        navigate(`/booking/${flight.id}`);
    };

    const status = (
        flight.status ?? "AVAILABLE"
    ).toUpperCase();

    /**
     * Check whether the departure time has passed.
     */
    const hasDeparted =
        new Date(flight.departureTime).getTime() <=
        // eslint-disable-next-line react-hooks/purity
        Date.now();

    /**
     * Flight is bookable only when:
     * - Backend status is AVAILABLE
     * - Departure time has not passed
     */
    const isBookable =
        status === "AVAILABLE" && !hasDeparted;

    /**
     * Display UNAVAILABLE when an AVAILABLE
     * flight has already departed.
     */
    const displayStatus =
        hasDeparted && status === "AVAILABLE"
            ? "UNAVAILABLE"
            : status;

    const statusStyles = () => {
        switch (displayStatus) {
            case "AVAILABLE":
                return "bg-green-100 text-green-700";

            case "CONFIRMED":
                return "bg-green-100 text-green-700";

            case "DELAYED":
                return "bg-yellow-100 text-yellow-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            case "UNAVAILABLE":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">

                <div>
                    <p className="text-sm text-gray-500">
                        Flight
                    </p>

                    <h3 className="text-xl font-bold">
                        {flight.flightNumber}
                    </h3>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles()}`}
                >
                    {displayStatus}
                </span>
            </div>

            {/* Route */}
            <div className="px-6 py-5">

                <div className="flex items-center justify-between gap-4">

                    {/* Departure */}
                    <div>
                        <p className="text-sm text-gray-500">
                            Departure
                        </p>

                        <p className="font-semibold">
                            {formatDate(
                                flight.departureTime
                            )}
                        </p>

                        <p className="text-gray-600">
                            {formatTime(
                                flight.departureTime
                            )}
                        </p>
                    </div>

                    {/* Flight line */}
                    <div className="flex-1 border-t border-dashed border-gray-300 relative">

                        <span className="absolute left-1/2 -top-4 -translate-x-1/2 bg-white px-2 text-xl">
                            ✈
                        </span>

                    </div>

                    {/* Arrival */}
                    <div className="text-right">

                        <p className="text-sm text-gray-500">
                            Arrival
                        </p>

                        <p className="font-semibold">
                            {formatDate(
                                flight.arrivalTime
                            )}
                        </p>

                        <p className="text-gray-600">
                            {formatTime(
                                flight.arrivalTime
                            )}
                        </p>

                    </div>
                </div>

                {/* Destination */}
                <div className="mt-5">

                    <p className="text-sm text-gray-500">
                        Destination
                    </p>

                    <p className="text-lg font-semibold">
                        {flight.destination}
                    </p>

                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-5 bg-gray-50 border-t">

                {/* Price */}
                <div>

                    <p className="text-sm text-gray-500">
                        Starting From
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                        {flight.startingPrice != null
                            ? `$${flight.startingPrice.toFixed(2)}`
                            : "Price unavailable"}
                    </p>

                </div>

                {/* Booking button */}
                {isBookable ? (
                    <Button onClick={handleBookFlight}>
                        Book Flight
                    </Button>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="px-5 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed font-semibold"
                    >
                        Unavailable
                    </button>
                )}

            </div>
        </div>
    );
}