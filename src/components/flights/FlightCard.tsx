import {
    ArrowRight,
    CalendarDays,
    Clock3,
    MapPin,
    Plane,
} from "lucide-react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import type { Flight } from "../../types/Flight";
import { useAuth } from "../../context/useAuth";
import Button from "../common/Button";

import {
    formatDate,
    formatTime,
} from "../../utils/formatDate";

import { getBookingDraft } from "../../utils/bookingDraft";

interface FlightCardProps {
    flight: Flight;
    onSelect?: () => void;
}

interface LocationState {
    returnSelection?: boolean;
}

const calculateDuration = (
    departureTime: string,
    arrivalTime: string
): string => {
    const departure = new Date(departureTime).getTime();
    const arrival = new Date(arrivalTime).getTime();
    const difference = arrival - departure;

    if (difference <= 0) {
        return "Duration unavailable";
    }

    const totalMinutes = Math.floor(
        difference / (1000 * 60)
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
};

const FlightCard = ({
                        flight,
                        onSelect,
                    }: FlightCardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const locationState =
        location.state as LocationState | null;

    const draft = getBookingDraft();

    const isReturnSelection =
        locationState?.returnSelection === true ||
        draft?.selectingReturn === true;

    const status = (
        flight.status ?? "SCHEDULED"
    ).toUpperCase();

    const isBookable =
        status === "SCHEDULED" ||
        status === "AVAILABLE";

    const duration = calculateDuration(
        flight.departureTime,
        flight.arrivalTime
    );

    const statusStyles = (): string => {
        switch (status) {
            case "SCHEDULED":
                return "border-blue-200 bg-blue-50 text-blue-700";

            case "AVAILABLE":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";

            case "BOARDING":
                return "border-amber-200 bg-amber-50 text-amber-700";

            case "FULL":
                return "border-orange-200 bg-orange-50 text-orange-700";

            case "DEPARTED":
            case "COMPLETED":
                return "border-slate-200 bg-slate-100 text-slate-600";

            case "CANCELLED":
                return "border-red-200 bg-red-50 text-red-700";

            default:
                return "border-slate-200 bg-slate-100 text-slate-600";
        }
    };

    const handleBookFlight = () => {
        /*
         * AvailableFlightsPage controls navigation when it supplies
         * onSelect. Return here to prevent a second navigation.
         */
        if (onSelect) {
            onSelect();
            return;
        }

        const bookingState = isReturnSelection
            ? {
                returnBooking: true,
                returnFlight: flight,
            }
            : {
                flight,
            };

        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/booking/${flight.id}`,
                    ...bookingState,
                },
            });

            return;
        }

        navigate(`/booking/${flight.id}`, {
            state: bookingState,
        });
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Plane size={21} />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-500">
                            {flight.airline}
                        </p>

                        <h3 className="mt-0.5 text-lg font-bold text-slate-950">
                            {flight.flightNumber}
                        </h3>
                    </div>
                </div>

                <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles()}`}
                >
                    {status}
                </span>
            </header>

            {isReturnSelection && (
                <div className="border-b border-blue-100 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700">
                    Select this flight for your return journey
                </div>
            )}

            <div className="flex flex-1 flex-col px-5 py-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                    <section>
                        <p className="text-2xl font-bold text-slate-950">
                            {flight.origin.code}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                            {flight.origin.city}
                        </p>

                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {flight.origin.name}
                        </p>
                    </section>

                    <div className="flex min-w-19 flex-col items-center pt-3">
                        <span className="text-xs font-medium text-slate-500">
                            {duration}
                        </span>

                        <div className="mt-2 flex w-full items-center">
                            <span className="h-2 w-2 rounded-full border-2 border-blue-500 bg-white" />
                            <span className="flex-1 border-t border-dashed border-slate-300" />
                            <ArrowRight
                                className="-ml-1 text-blue-500"
                                size={15}
                            />
                        </div>

                        <span className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Direct
                        </span>
                    </div>

                    <section className="text-right">
                        <p className="text-2xl font-bold text-slate-950">
                            {flight.destination.code}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                            {flight.destination.city}
                        </p>

                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {flight.destination.name}
                        </p>
                    </section>
                </div>

                <div className="my-5 border-t border-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <CalendarDays size={14} />
                            Departure
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                            {formatDate(flight.departureTime)}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock3 size={14} />
                            {formatTime(flight.departureTime)}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <MapPin size={14} />
                            Arrival
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                            {formatDate(flight.arrivalTime)}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock3 size={14} />
                            {formatTime(flight.arrivalTime)}
                        </p>
                    </div>
                </div>
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Starting from
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                        {flight.startingPrice !== null
                            ? new Intl.NumberFormat("en-IE", {
                                style: "currency",
                                currency: "EUR",
                            }).format(Number(flight.startingPrice))
                            : "Price unavailable"}
                    </p>
                </div>

                {isBookable ? (
                    <Button onClick={handleBookFlight}>
                        {isReturnSelection
                            ? "Select return"
                            : "Book flight"}
                    </Button>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
                    >
                        Unavailable
                    </button>
                )}
            </footer>
        </article>
    );
};

export default FlightCard;