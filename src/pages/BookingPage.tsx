import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plane, Trash2 } from "lucide-react";
import {
    Navigate,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import BookingForm from "../components/bookings/BookingForm";
import { getFlightById } from "../services/flightService";
import { clearBookingDraft, getBookingDraft } from "../utils/bookingDraft";
import type { Flight } from "../types/Flight";

interface BookingLocationState {
    flight?: Flight;
    outboundFlight?: Flight;
    returnFlight?: Flight;
    returnBooking?: boolean;
}

interface FlightLoadResult {
    requestKey: string | null;
    flight: Flight | null;
    error: string | null;
}

interface PageMessageProps {
    title: string;
    message: string;
    loading?: boolean;
}

const PageMessage = ({
                         title,
                         message,
                         loading = false,
                     }: PageMessageProps) => (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                        loading
                            ? "bg-blue-50 text-blue-600"
                            : "bg-red-50 text-red-600"
                    }`}
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <AlertCircle size={24} />
                    )}
                </div>
                <h1 className="mt-4 text-xl font-bold text-slate-900">
                    {title}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{message}</p>
            </div>
        </div>
    </main>
);

const BookingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const state = location.state as BookingLocationState | null;
    const draft = getBookingDraft();

    const flightId = Number(id);
    const validFlightId = Number.isInteger(flightId) && flightId > 0;

    const isReturnBooking =
        draft?.tripType === "ROUND_TRIP" &&
        (state?.returnBooking === true || draft.selectingReturn);

    const flightFromNavigation = isReturnBooking
        ? state?.returnFlight ?? null
        : state?.outboundFlight ?? state?.flight ?? null;

    const requestKey =
        validFlightId && !flightFromNavigation
            ? `${isReturnBooking ? "return" : "outbound"}:${flightId}`
            : null;

    const [loadResult, setLoadResult] = useState<FlightLoadResult>({
        requestKey: null,
        flight: null,
        error: null,
    });

    useEffect(() => {
        if (!requestKey) return;

        let active = true;

        void getFlightById(flightId)
            .then((flight) => {
                if (!active) return;

                setLoadResult({
                    requestKey,
                    flight,
                    error: null,
                });
            })
            .catch(() => {
                if (!active) return;

                setLoadResult({
                    requestKey,
                    flight: null,
                    error: isReturnBooking
                        ? "We could not load the selected return flight."
                        : "We could not load the selected flight.",
                });
            });

        return () => {
            active = false;
        };
    }, [flightId, isReturnBooking, requestKey]);

    const requestCompleted =
        requestKey !== null && loadResult.requestKey === requestKey;
    const loading = requestKey !== null && !requestCompleted;
    const error = requestCompleted ? loadResult.error : null;
    const loadedFlight = requestCompleted ? loadResult.flight : null;

    const outboundFlight = isReturnBooking
        ? draft?.outboundFlight ?? null
        : state?.outboundFlight ?? state?.flight ?? loadedFlight;

    const returnFlight = isReturnBooking
        ? state?.returnFlight ?? loadedFlight
        : null;

    const discardBooking = () => {
        clearBookingDraft();
        navigate("/available", { replace: true });
    };

    if (!id) {
        return <Navigate to="/available" replace />;
    }

    if (!validFlightId) {
        return (
            <PageMessage
                title="Invalid flight"
                message="The flight link is invalid. Please return to available flights and try again."
            />
        );
    }

    if (loading) {
        return (
            <PageMessage
                loading
                title="Preparing your booking"
                message="We are loading the latest flight and seat information."
            />
        );
    }

    if (error) {
        return <PageMessage title="Unable to continue" message={error} />;
    }

    if (isReturnBooking && !draft) {
        return (
            <PageMessage
                title="Booking session expired"
                message="Your previous booking details are no longer available. Please start again."
            />
        );
    }

    if (!outboundFlight || (isReturnBooking && !returnFlight)) {
        return <Navigate to="/available" replace />;
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
                            <Plane size={17} />
                            Secure flight booking
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                            Complete your trip
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Passenger details, seats, and payment summary in one guided flow.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={discardBooking}
                        className="inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 size={16} />
                        Discard booking
                    </button>
                </div>

                <BookingForm
                    outboundFlight={outboundFlight}
                    returnFlight={returnFlight ?? undefined}
                    initialTripType={isReturnBooking ? draft?.tripType : undefined}
                    initialSeatClass={isReturnBooking ? draft?.seatClass : undefined}
                    initialPassengers={isReturnBooking ? draft?.passengers : undefined}
                    initialStep={isReturnBooking ? "SEATS" : undefined}
                    initialDirection={isReturnBooking ? "RETURN" : undefined}
                    onDiscard={discardBooking}
                />
            </div>
        </main>
    );
};

export default BookingPage;
