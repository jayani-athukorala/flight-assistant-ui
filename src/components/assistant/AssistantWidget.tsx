import { useCallback, useEffect, useMemo, useState } from "react";
import { assistantService } from "../../services/assistantService";
import { bookFlight, getMyBookings } from "../../services/bookingService";
import { getAvailableSeats, getReturnFlights } from "../../services/flightService";
import { useAuth } from "../../context/useAuth";
import type { AssistantResponse, AssistantUiMessage } from "../../types/Assistant";
import type { BookingResponse, PassengerRequest, TripType } from "../../types/Booking";
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
import AuthForm from "../auth/AuthForm";

const STORAGE_KEY = "skyroute.assistant.session";

interface StoredSession {
    conversationId: string | null;
    messages: AssistantUiMessage[];
}

const emptySession: StoredSession = {
    conversationId: null,
    messages: [],
};

type BookingPhase =
    | "COUNT"
    | "DETAILS"
    | "OUTBOUND_SEATS"
    | "RETURN_CHOICE"
    | "RETURN_DATE"
    | "RETURN_FLIGHTS"
    | "RETURN_SEATS"
    | "REVIEW"
    | "COMPLETE";

interface AssistantBookingFlow {
    phase: BookingPhase;
    outboundFlight: Flight;
    returnFlight: Flight | null;
    tripType: TripType;
    seatClass: SeatClass;
    passengerCount: number;
    passengers: PassengerRequest[];
    returnDate: string;
    returnFlights: Flight[];
    outboundSeats: FlightSeat[];
    returnSeats: FlightSeat[];
    booking: BookingResponse | null;
    loading: boolean;
    error: string | null;
}

const createPassenger = (): PassengerRequest => ({
    firstName: "",
    lastName: "",
    passportNumber: "",
    email: "",
    outboundSeatId: 0,
    returnSeatId: null,
});

const readSession = (): StoredSession => {
    try {
        const value = sessionStorage.getItem(STORAGE_KEY);

        if (!value) {
            return emptySession;
        }

        const parsed = JSON.parse(value) as StoredSession;

        return Array.isArray(parsed.messages)
            ? parsed
            : emptySession;
    } catch {
        return emptySession;
    }
};

const uiMessage = (
    response: AssistantResponse
): AssistantUiMessage => ({
    id: crypto.randomUUID(),
    role: "assistant",
    text: response.message,
    response,
});

export default function AssistantWidget() {
    const { isAuthenticated } = useAuth();

    const [open, setOpen] = useState(false);

    const [session, setSession] =
        useState<StoredSession>(readSession);

    const [loading, setLoading] = useState(false);

    const [flightSearchOpen, setFlightSearchOpen] =
        useState(false);

    const [flow, setFlow] =
        useState<AssistantBookingFlow | null>(null);

    const [pendingFlight, setPendingFlight] =
    useState<Flight | null>(null);

    const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
    const [postAuthAction, setPostAuthAction] = useState<"booking" | "view" | "cancel" | null>(null);

    useEffect(() => {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(session)
        );
    }, [session]);

    const appendResponse = useCallback(
        (response: AssistantResponse) => {
            setSession((current) => ({
                conversationId: response.conversationId,
                messages: [
                    ...current.messages,
                    uiMessage(response),
                ],
            }));
        },
        []
    );

    const appendLocalAssistant = useCallback(
        (text: string, authenticationRequired = false) => {
            setSession((current) => ({
                ...current,
                messages: [
                    ...current.messages,
                    {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        text,
                        authenticationRequired,
                    },
                ],
            }));
        },
        []
    );

    const send = useCallback(
        async (
            message: string,
            displayText?: string
        ) => {
            if (loading) return;

            const userMessage: AssistantUiMessage = {
                id: crypto.randomUUID(),
                role: "user",
                text: displayText ?? message,
            };

            setSession((current) => ({
                ...current,
                messages: [
                    ...current.messages,
                    userMessage,
                ],
            }));

            setLoading(true);

            try {
                const response =
                    await assistantService.chat({
                        conversationId:
                            session.conversationId,
                        message,
                    });

                appendResponse(response);
            } catch {
                setSession((current) => ({
                    ...current,
                    messages: [
                        ...current.messages,
                        {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            text: "",
                            failedPrompt: message,
                        },
                    ],
                }));
            } finally {
                setLoading(false);
            }
        },
        [
            appendResponse,
            loading,
            session.conversationId,
        ]
    );

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

            setFlow({
                phase: "COUNT",
                outboundFlight: flight,
                returnFlight: null,
                tripType: "ONE_WAY",
                seatClass: "ECONOMY",
                passengerCount: 1,
                passengers: [createPassenger()],
                returnDate:
                    flight.departureTime.split("T")[0],
                returnFlights: [],
                outboundSeats: [],
                returnSeats: [],
                booking: null,
                loading: false,
                error: null,
            });

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
                        flow.seatClass
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
                `Booking ${booking.bookingReference} was created successfully.`
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
        const id =
            session.conversationId;

        setSession(emptySession);
        setFlow(null);
        setAuthMode(null);
        setPendingFlight(null);
        setPostAuthAction(null);

        if (id) {
            try {
                await assistantService
                    .clearConversation(id);
            } catch {
                // Local history is still safely cleared.
            }
        }
    };

    useEffect(() => {
        const resetAssistantSession =
            () => {
                sessionStorage.removeItem(
                    STORAGE_KEY
                );

                setSession(emptySession);
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
                <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-slate-900">
                        {authMode === "login" ? "Sign in inside the assistant" : "Create your account"}
                    </h3>
                    <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
                        Complete the form below and your previous task will continue automatically.
                    </p>
                    <AuthForm
                        key={authMode}
                        mode={authMode}
                        compact
                        loginAfterRegister
                        onSuccess={authenticationComplete}
                    />
                    <div className="mt-3 flex items-center justify-between text-xs">
                        <button type="button" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="font-semibold text-blue-700 hover:underline">
                            {authMode === "login" ? "Create an account" : "Already registered? Sign in"}
                        </button>
                        <button type="button" onClick={() => setAuthMode(null)} className="text-slate-500 hover:text-slate-800">Close</button>
                    </div>
                </section>
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
                        flight={
                            flow.outboundFlight
                        }
                        returnFlight={
                            flow.returnFlight
                        }
                        tripType="ROUND_TRIP"
                        seatClass={
                            flow.seatClass
                        }
                        passengers={
                            flow.passengers
                        }
                        direction="RETURN"
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

                    <button
                        type="button"
                        onClick={() =>
                            setFlow(null)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700"
                    >
                        Finish
                    </button>
                </div>
            );
        }

        return null;
    }, [
        authMode,
        authenticationComplete,
        flow,
        appendLocalAssistant,
        refreshBookings,
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
                    onAuthenticationRequired={requestProtectedAction}
                    onAuthenticate={setAuthMode}
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
