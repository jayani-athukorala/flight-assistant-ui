import { useCallback, useEffect, useMemo, useState } from "react";
import { bookFlight, getMyBookings } from "../../services/bookingService";
import { getAvailableSeats, getReturnFlights } from "../../services/flightService";
import { useAuth } from "../../context/useAuth";
import type { TripType } from "../../types/Booking";
import type { Flight, FlightSeat, SeatClass } from "../../types/Flight";
import type { Airport } from "../../types/Airport";
import AssistantButton from "./AssistantButton";
import AssistantPanel from "./AssistantPanel";
import FlightSearchModal from "../flights/FlightSearchModal";
import PassengerStep from "../bookings/PassengerStep";
import SeatsStep from "../bookings/SeatsStep";
import FlightCard from "../flights/FlightCard";
import BookingSummary from "../bookings/BookingSummary";
import BookingCard from "../bookings/BookingCard";
import AssistantAuthPanel from "./AssistantAuthPanel";
import { useAssistantChat } from "../../hooks/useAssistantChat";
import {
    createBookingFlow,
    createPassenger,
    type AssistantBookingFlow,
} from "./assistantBookingFlow";

export default function AssistantWidget() {
    const { isAuthenticated } = useAuth();

    const [open, setOpen] = useState(false);

    const { session, setSession, loading, send, appendLocalAssistant, clearConversation } = useAssistantChat();

    const [flightSearchOpen, setFlightSearchOpen] =
        useState(false);

    const [flow, setFlow] =
        useState<AssistantBookingFlow | null>(null);

    const [pendingFlight, setPendingFlight] =
    useState<Flight | null>(null);

    const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
    const [postAuthAction, setPostAuthAction] = useState<"booking" | "view" | "cancel" | null>(null);


    const startBooking = useCallback(
        (flight: Flight) => {
            if (!isAuthenticated) {
                setPendingFlight(flight);
                setPostAuthAction("booking");

                appendLocalAssistant(
                    `You selected flight ${flight.flightNumber} from ${flight.origin.city} to ${flight.destination.city}. A signed-in account is required before passenger and seat details can be added. Choose Sign in or Create account below; the form will open inside the assistant, and I will continue this booking after authentication.`,
                    true
                );
                return;
            }

            setFlow(createBookingFlow(flight));

            appendLocalAssistant(
                "Great. How many passengers are travelling?"
            );
        },
        [
            appendLocalAssistant,
            isAuthenticated,
        ]
    );

    const requestProtectedAction = useCallback((purpose: "view" | "cancel") => {
        if (isAuthenticated) {
            setFlow(null);
            void send(
                purpose === "cancel"
                    ? "Show my active bookings so I can choose one to cancel using the booking card."
                    : "Show my active bookings.",
                purpose === "cancel" ? "Choose a booking to cancel" : "View my bookings"
            );
            return;
        }

        setPostAuthAction(purpose);
        appendLocalAssistant(
            purpose === "cancel"
                ? "To cancel a booking, I first need to securely load the current bookings linked to your account. Choose Sign in or Create account below. The form will open inside the assistant; afterward I will show your bookings so you can click Cancel booking on the one you wish to cancel."
                : "To show your current bookings, I need to verify your account. Choose Sign in or Create account below; the form will open inside the assistant and I will load your bookings after authentication.",
            true
        );
    }, [appendLocalAssistant, isAuthenticated, send]);

    const authenticationComplete = useCallback(() => {
        setAuthMode(null);
        appendLocalAssistant("You are signed in successfully. I’ll now continue with your previous request.");
    }, [appendLocalAssistant]);

    useEffect(() => {
        if (!isAuthenticated || !postAuthAction || authMode) return;

        const action = postAuthAction;
        setPostAuthAction(null);

        if (action === "booking" && pendingFlight) {
            const flight = pendingFlight;
            setPendingFlight(null);
            startBooking(flight);
            return;
        }

        if (action === "view" || action === "cancel") {
            void send(
                action === "cancel"
                    ? "Show my active bookings so I can choose one to cancel using the booking card."
                    : "Show my active bookings.",
                "Load my bookings"
            );
        }
    }, [authMode, isAuthenticated, pendingFlight, postAuthAction, send, startBooking]);

    const updatePassengerCount = (
        count: number
    ) => {
        setFlow((current) => {
            if (!current) return current;

            const nextCount = Math.max(
                1,
                Math.min(6, count)
            );

            const passengers =
                current.passengers.slice(
                    0,
                    nextCount
                );

            while (
                passengers.length < nextCount
            ) {
                passengers.push(createPassenger());
            }

            return {
                ...current,
                passengerCount: nextCount,
                passengers,
                error: null,
            };
        });
    };

    const updatePassenger = (
        index: number,
        field:
            | "firstName"
            | "lastName"
            | "passportNumber"
            | "email",
        value: string
    ) => {
        setFlow((current) =>
            current
                ? {
                    ...current,
                    passengers:
                        current.passengers.map(
                            (
                                passenger,
                                passengerIndex
                            ) =>
                                passengerIndex ===
                                index
                                    ? {
                                        ...passenger,
                                        [field]:
                                            value,
                                    }
                                    : passenger
                        ),
                    error: null,
                }
                : current
        );
    };

    const updateSeat = (
        passengerIndex: number,
        field:
            | "outboundSeatId"
            | "returnSeatId",
        seatId: number | null,
        _seat: FlightSeat | null
    ) => {
        setFlow((current) =>
            current
                ? {
                    ...current,
                    passengers:
                        current.passengers.map(
                            (
                                passenger,
                                index
                            ) =>
                                index ===
                                passengerIndex
                                    ? {
                                        ...passenger,
                                        [field]:
                                            field ===
                                            "outboundSeatId"
                                                ? seatId ??
                                                0
                                                : seatId,
                                    }
                                    : passenger
                        ),
                    error: null,
                }
                : current
        );
    };

    const updateSeatClass = (seatClass: SeatClass) => {
        setFlow((current) => current
            ? {
                ...current,
                seatClass,
                passengers: current.passengers.map((passenger) => ({
                    ...passenger,
                    outboundSeatId: 0,
                })),
                outboundSeats: [],
                error: null,
            }
            : current
        );
    };

    const updateReturnSeatClass = (returnSeatClass: SeatClass) => {
        setFlow((current) => current
            ? {
                ...current,
                returnSeatClass,
                passengers: current.passengers.map((passenger) => ({
                    ...passenger,
                    returnSeatId: null,
                })),
                returnSeats: [],
                error: null,
            }
            : current
        );
    };

    const prepareReview = async (
        tripType: TripType,
        returnFlight: Flight | null
    ) => {
        if (!flow) return;

        setFlow((current) =>
            current
                ? {
                    ...current,
                    loading: true,
                    error: null,
                }
                : current
        );

        try {
            const [
                outboundSeats,
                returnSeats,
            ] = await Promise.all([
                getAvailableSeats(
                    flow.outboundFlight.id,
                    flow.seatClass
                ),

                tripType === "ROUND_TRIP" &&
                returnFlight
                    ? getAvailableSeats(
                        returnFlight.id,
                        flow.returnSeatClass
                    )
                    : Promise.resolve(
                        [] as FlightSeat[]
                    ),
            ]);

            setFlow((current) =>
                current
                    ? {
                        ...current,
                        tripType,
                        returnFlight,
                        outboundSeats,
                        returnSeats,
                        phase: "REVIEW",
                        loading: false,
                    }
                    : current
            );
        } catch {
            setFlow((current) =>
                current
                    ? {
                        ...current,
                        loading: false,
                        error:
                            "Unable to refresh seat details for the booking review.",
                    }
                    : current
            );
        }
    };

    const searchReturnFlights =
        async () => {
            if (!flow?.returnDate) return;

            setFlow((current) =>
                current
                    ? {
                        ...current,
                        loading: true,
                        error: null,
                    }
                    : current
            );

            try {
                const flights =
                    await getReturnFlights(
                        flow.outboundFlight
                            .destination.id,
                        flow.outboundFlight
                            .origin.id,
                        flow.returnDate
                    );

                setFlow((current) =>
                    current
                        ? {
                            ...current,
                            returnFlights:
                                flights,
                            phase:
                                "RETURN_FLIGHTS",
                            loading: false,
                            error: flights.length
                                ? null
                                : "No return flights are available on that date.",
                        }
                        : current
                );
            } catch {
                setFlow((current) =>
                    current
                        ? {
                            ...current,
                            loading: false,
                            error:
                                "Unable to search return flights.",
                        }
                        : current
                );
            }
        };

    const confirmBooking = async () => {
        if (!flow) return;

        setFlow((current) =>
            current
                ? {
                    ...current,
                    loading: true,
                    error: null,
                }
                : current
        );

        try {
            const booking =
                await bookFlight({
                    outboundFlightId:
                        flow.outboundFlight.id,
                    returnFlightId:
                        flow.returnFlight?.id ??
                        null,
                    passengers:
                        flow.passengers,
                });

            setFlow((current) =>
                current
                    ? {
                        ...current,
                        booking,
                        phase: "COMPLETE",
                        loading: false,
                    }
                    : current
            );

            appendLocalAssistant(
                `Your booking was created successfully. Reference: ${booking.bookingReference}. Route: ${booking.outboundFlight.origin.code} to ${booking.outboundFlight.destination.code}. Passengers: ${booking.passengers.length}. Total: ${new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(booking.totalPrice)}. You can review it below, then choose whether to view all bookings or cancel a booking.`
            );
        } catch (error: unknown) {
            const message =
                typeof error === "object" &&
                error !== null &&
                "response" in error
                    ? (
                        error as {
                            response?: {
                                data?: {
                                    message?: string;
                                    error?: string;
                                };
                            };
                        }
                    ).response?.data?.message ??
                    (
                        error as {
                            response?: {
                                data?: {
                                    message?: string;
                                    error?: string;
                                };
                            };
                        }
                    ).response?.data?.error
                    : undefined;

            setFlow((current) =>
                current
                    ? {
                        ...current,
                        loading: false,
                        error:
                            message ??
                            "Unable to complete the booking. Please try again.",
                    }
                    : current
            );
        }
    };

    const refreshBookings =
        useCallback(async () => {
            try {
                const bookings =
                    await getMyBookings();

                setSession((current) => ({
                    ...current,
                    messages:
                        current.messages.map(
                            (message) =>
                                message.response
                                    ?.bookings
                                    ?.length
                                    ? {
                                        ...message,
                                        response: {
                                            ...message.response,
                                            bookings,
                                        },
                                    }
                                    : message
                        ),
                }));

                setFlow((current) => {
                    if (!current?.booking) {
                        return current;
                    }

                    const updated =
                        bookings.find(
                            (booking) =>
                                booking.id ===
                                current.booking?.id
                        );

                    return updated
                        ? {
                            ...current,
                            booking: updated,
                        }
                        : current;
                });
            } catch {
                // The existing card already displays
                // cancellation errors if the request fails.
            }
        }, []);

    const clear = async () => {
        setFlow(null);
        setAuthMode(null);
        setPendingFlight(null);
        setPostAuthAction(null);
        await clearConversation();
    };

    const exitAssistant = useCallback(() => {
        setFlow(null);
        setAuthMode(null);
        setPendingFlight(null);
        setPostAuthAction(null);
        appendLocalAssistant(
            "Thank you for using SkyRoute. Have a pleasant journey, and come back anytime you need help with another flight."
        );
    }, [appendLocalAssistant]);

    useEffect(() => {
        const resetAssistantSession =
            () => {
                setFlow(null);
            };

        window.addEventListener(
            "auth:identity-changed",
            resetAssistantSession
        );

        window.addEventListener(
            "auth:logout",
            resetAssistantSession
        );

        return () => {
            window.removeEventListener(
                "auth:identity-changed",
                resetAssistantSession
            );

            window.removeEventListener(
                "auth:logout",
                resetAssistantSession
            );
        };
    }, []);

    const workflow = useMemo(() => {
        if (authMode) {
            return (
                <AssistantAuthPanel
                    mode={authMode}
                    onModeChange={setAuthMode}
                    onSuccess={authenticationComplete}
                    onClose={() => setAuthMode(null)}
                />
            );
        }

        if (!flow) return null;

        const error = flow.error ? (
            <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
                {flow.error}
            </p>
        ) : null;

        if (flow.phase === "COUNT") {
            return (
                <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-2">
                    {error}

                    <PassengerStep
                        mode="COUNT_ONLY"
                        passengers={
                            flow.passengers
                        }
                        adultCount={
                            flow.passengerCount
                        }
                        onAdultCountChange={
                            updatePassengerCount
                        }
                        onPassengerChange={
                            updatePassenger
                        }
                        onContinue={() => {
                            setFlow(
                                (current) =>
                                    current
                                        ? {
                                            ...current,
                                            phase:
                                                "DETAILS",
                                        }
                                        : current
                            );

                            appendLocalAssistant(
                                "Please enter passenger 1 details. Continue passenger by passenger."
                            );
                        }}
                        continueLabel="Enter passenger details"
                    />
                </div>
            );
        }

        if (flow.phase === "DETAILS") {
            return (
                <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-2">
                    {error}

                    <PassengerStep
                        mode="DETAILS_ONLY"
                        passengers={
                            flow.passengers
                        }
                        adultCount={
                            flow.passengerCount
                        }
                        onAdultCountChange={
                            updatePassengerCount
                        }
                        onPassengerChange={
                            updatePassenger
                        }
                        onContinue={() => {
                            setFlow(
                                (current) =>
                                    current
                                        ? {
                                            ...current,
                                            phase:
                                                "OUTBOUND_SEATS",
                                        }
                                        : current
                            );

                            appendLocalAssistant(
                                "Passenger details are complete. Select one outbound seat for each passenger."
                            );
                        }}
                        continueLabel="Choose outbound seats"
                    />
                </div>
            );
        }

        if (
            flow.phase ===
            "OUTBOUND_SEATS"
        ) {
            return (
                <div className="space-y-3">
                    {error}

                    <SeatsStep
                        compact
                        flight={
                            flow.outboundFlight
                        }
                        tripType="ONE_WAY"
                        seatClass={
                            flow.seatClass
                        }
                        passengers={
                            flow.passengers
                        }
                        direction="OUTBOUND"
                        onSeatClassChange={updateSeatClass}
                        onPassengerSeatChange={
                            updateSeat
                        }
                        onContinue={() => {
                            setFlow(
                                (current) =>
                                    current
                                        ? {
                                            ...current,
                                            phase:
                                                "RETURN_CHOICE",
                                        }
                                        : current
                            );

                            appendLocalAssistant(
                                "Would you like to book a return flight too?"
                            );
                        }}
                        continueLabel="Continue"
                    />
                </div>
            );
        }

        if (
            flow.phase ===
            "RETURN_CHOICE"
        ) {
            return (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    {error}

                    <h3 className="font-bold text-slate-900">
                        Book a return flight?
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Passenger details will be
                        reused. You will only choose
                        the return flight and a return
                        seat for each passenger.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={flow.loading}
                            onClick={() =>
                                void prepareReview(
                                    "ONE_WAY",
                                    null
                                )
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            No, one way
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setFlow(
                                    (current) =>
                                        current
                                            ? {
                                                ...current,
                                                tripType:
                                                    "ROUND_TRIP",
                                                phase:
                                                    "RETURN_DATE",
                                            }
                                            : current
                                )
                            }
                            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            Yes, add return
                        </button>
                    </div>
                </div>
            );
        }

        if (
            flow.phase ===
            "RETURN_DATE"
        ) {
            /*
             * This existing assistant booking flow remains unchanged.
             *
             * The return-date restriction is handled here:
             * the return date must be after the outbound
             * arrival date.
             */
            const minimumDate = new Date(
                flow.outboundFlight.arrivalTime
            );

            minimumDate.setDate(
                minimumDate.getDate() + 1
            );

            const minimumDateValue =
                minimumDate
                    .toISOString()
                    .split("T")[0];

            return (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    {error}

                    <h3 className="font-bold text-slate-900">
                        What date would you
                        like to return?
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Route:{" "}
                        {
                            flow.outboundFlight
                                .destination
                                .code
                        }{" "}
                        →{" "}
                        {
                            flow.outboundFlight
                                .origin
                                .code
                        }
                    </p>

                    <input
                        type="date"
                        min={minimumDateValue}
                        value={
                            flow.returnDate
                        }
                        onChange={(event) =>
                            setFlow(
                                (current) =>
                                    current
                                        ? {
                                            ...current,
                                            returnDate:
                                                event
                                                    .target
                                                    .value,
                                            error: null,
                                        }
                                        : current
                            )
                        }
                        className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                        type="button"
                        disabled={
                            !flow.returnDate ||
                            flow.loading
                        }
                        onClick={() =>
                            void searchReturnFlights()
                        }
                        className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {flow.loading
                            ? "Searching…"
                            : "Search return flights"}
                    </button>
                </div>
            );
        }

        if (
            flow.phase ===
            "RETURN_FLIGHTS"
        ) {
            return (
                <div className="space-y-3">
                    {error}

                    {flow.returnFlights.map(
                        (flight) => (
                            <FlightCard
                                key={flight.id}
                                flight={flight}
                                actionLabel="Select return"
                                onSelect={() => {
                                    setFlow(
                                        (
                                            current
                                        ) =>
                                            current
                                                ? {
                                                    ...current,
                                                    returnFlight:
                                                        flight,
                                                    phase:
                                                        "RETURN_SEATS",
                                                    error: null,
                                                }
                                                : current
                                    );

                                    appendLocalAssistant(
                                        "Return flight selected. Choose one return seat for each passenger. Passenger details are reused."
                                    );
                                }}
                            />
                        )
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            setFlow(
                                (current) =>
                                    current
                                        ? {
                                            ...current,
                                            phase:
                                                "RETURN_DATE",
                                        }
                                        : current
                            )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700"
                    >
                        Change return date
                    </button>
                </div>
            );
        }

        if (
            flow.phase ===
                "RETURN_SEATS" &&
            flow.returnFlight
        ) {
            return (
                <div className="space-y-3">
                    {error}

                    <SeatsStep
                        compact
                        flight={
                            flow.outboundFlight
                        }
                        returnFlight={
                            flow.returnFlight
                        }
                        tripType="ROUND_TRIP"
                        seatClass={
                            flow.returnSeatClass
                        }
                        passengers={
                            flow.passengers
                        }
                        direction="RETURN"
                        onSeatClassChange={updateReturnSeatClass}
                        onPassengerSeatChange={
                            updateSeat
                        }
                        onContinue={() =>
                            void prepareReview(
                                "ROUND_TRIP",
                                flow.returnFlight
                            )
                        }
                        continueLabel="Review booking"
                    />
                </div>
            );
        }

        if (
            flow.phase ===
            "REVIEW"
        ) {
            return (
                <div className="space-y-3">
                    {error}

                    <BookingSummary
                        outboundFlight={
                            flow.outboundFlight
                        }
                        returnFlight={
                            flow.returnFlight ??
                            undefined
                        }
                        tripType={
                            flow.tripType
                        }
                        passengers={
                            flow.passengers
                        }
                        outboundSeats={
                            flow.outboundSeats
                        }
                        returnSeats={
                            flow.returnSeats
                        }
                        loading={
                            flow.loading
                        }
                        onBack={() =>
                            setFlow(
                                (current) =>
                                    current
                                        ? {
                                            ...current,
                                            phase:
                                                current.tripType ===
                                                "ROUND_TRIP"
                                                    ? "RETURN_SEATS"
                                                    : "RETURN_CHOICE",
                                        }
                                        : current
                            )
                        }
                        onConfirm={() =>
                            void confirmBooking()
                        }
                    />
                </div>
            );
        }

        if (
            flow.phase ===
                "COMPLETE" &&
            flow.booking
        ) {
            return (
                <div className="space-y-3">
                    <BookingCard
                        booking={
                            flow.booking
                        }
                        onChanged={
                            refreshBookings
                        }
                    />

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="text-xs leading-5 text-blue-900">
                            What would you like to do next?
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => requestProtectedAction("view")} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                                View my bookings
                            </button>
                            <button type="button" onClick={() => requestProtectedAction("cancel")} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">
                                Cancel a booking
                            </button>
                            <button type="button" onClick={exitAssistant} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    }, [
        authMode,
        authenticationComplete,
        flow,
        appendLocalAssistant,
        exitAssistant,
        refreshBookings,
        requestProtectedAction,
    ]);

    /*
     * ONLY CHANGE NEEDED IN THIS FILE:
     *
     * The search modal now returns:
     *
     *     origin
     *     destination
     *     departureDate
     *
     * We pass the selected date to the assistant instead of
     * asking the assistant to invent/ask for the date.
     */
    const handleModalSearch = (
        origin: Airport,
        destination: Airport,
        departureDate: string
    ) => {
        setFlightSearchOpen(false);

        void send(
            `I want to search available flights from trusted origin airport ID ${origin.id} (${origin.code}) to trusted destination airport ID ${destination.id} (${destination.code}) for departure date ${departureDate}. Use this exact departure date. Do not ask me for the departure date again.`,
            `Search ${origin.code} → ${destination.code} on ${departureDate}`
        );
    };

    return (
        <>
            <AssistantButton
                open={open}
                onClick={() =>
                    setOpen((value) => !value)
                }
            />

            {open && (
                <AssistantPanel
                    messages={
                        session.messages
                    }
                    loading={loading}
                    workflow={workflow}
                    onClose={() =>
                        setOpen(false)
                    }
                    onClear={clear}
                    onSend={send}
                    onOpenFlightSearch={() =>
                        setFlightSearchOpen(
                            true
                        )
                    }
                    onSelectFlight={
                        startBooking
                    }
                    onBookingChanged={
                        refreshBookings
                    }
                    onExit={exitAssistant}
                    onAuthenticationRequired={requestProtectedAction}
                    onAuthenticate={setAuthMode}
                    onChangeFlightDate={handleModalSearch}
                />
            )}

            <FlightSearchModal
                open={flightSearchOpen}
                onClose={() =>
                    setFlightSearchOpen(
                        false
                    )
                }
                onSearch={
                    handleModalSearch
                }
            />
        </>
    );
}
