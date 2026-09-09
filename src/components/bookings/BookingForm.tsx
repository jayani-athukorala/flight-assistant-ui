import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import TripTypeStep from "./TripTypeStep";
import PassengerStep from "./PassengerStep";
import SeatsStep from "./SeatsStep";

import Button from "../common/Button";

import {
    bookFlight,
} from "../../services/bookingService";

import {
    saveBookingDraft,
    clearBookingDraft,
} from "../../utils/bookingDraft";

import type {
    BookingRequest,
    PassengerRequest,
    TripType,
} from "../../types/Booking";

import type {
    Flight,
    FlightSeat,
    SeatClass,
} from "../../types/Flight";

interface BookingFormProps {
    outboundFlight: Flight;
    returnFlight?: Flight;
    initialTripType?: TripType;
    initialSeatClass?: SeatClass;
    initialPassengers?: PassengerRequest[];
    initialStep?: "TRIP" | "PASSENGERS" | "SEATS" | "REVIEW";
    initialDirection?: "OUTBOUND" | "RETURN";
    onDiscard?: () => void;
}

type Step =
    | "TRIP"
    | "PASSENGERS"
    | "SEATS"
    | "REVIEW";

type Direction =
    | "OUTBOUND"
    | "RETURN";

const createPassenger =
    (): PassengerRequest => ({
        firstName: "",
        lastName: "",
        passportNumber: "",
        email: "",
        outboundSeatId: 0,
        returnSeatId: null,
    });

const BookingForm = ({
                         outboundFlight,
                         returnFlight: initialReturnFlight,
                         initialTripType = "ONE_WAY",
                         initialSeatClass = "ECONOMY",
                         initialPassengers,
                         initialStep = "TRIP",
                         initialDirection = "OUTBOUND",
                         onDiscard,
                     }: BookingFormProps) => {
    const navigate = useNavigate();

    const [tripType, setTripType] =
        useState<TripType>(
            initialTripType
        );

    const [outboundSeatClass, setOutboundSeatClass] =
        useState<SeatClass>(initialSeatClass);

    const [returnSeatClass, setReturnSeatClass] =
        useState<SeatClass>(initialSeatClass);

    const [adultCount, setAdultCount] =
        useState(
            initialPassengers?.length ??
            1
        );

    const [passengers, setPassengers] =
        useState<PassengerRequest[]>(
            initialPassengers?.length
                ? initialPassengers
                : [createPassenger()]
        );

    const [step, setStep] =
        useState<Step>(
            initialStep
        );

    const [direction, setDirection] =
        useState<Direction>(
            initialDirection
        );

    const [returnFlight, setReturnFlight] =
        useState<Flight | undefined>(
            initialReturnFlight
        );

    const [seatPrices, setSeatPrices] =
        useState<Record<string, number>>({});

    const [error, setError] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(false);

    // ------------------------------------------------------------
    // TRIP TYPE
    // ------------------------------------------------------------

    const handleTripTypeChange = (
        nextType: TripType
    ) => {
        setTripType(nextType);

        if (nextType === "ONE_WAY") {
            setReturnFlight(undefined);

            setPassengers(
                (current) =>
                    current.map(
                        (passenger) => ({
                            ...passenger,
                            returnSeatId: null,
                        })
                    )
            );

            setSeatPrices(
                (current) => {
                    const next = {
                        ...current,
                    };

                    Object.keys(next)
                        .filter((key) =>
                            key.startsWith(
                                "returnSeatId:"
                            )
                        )
                        .forEach(
                            (key) => {
                                delete next[key];
                            }
                        );

                    return next;
                }
            );
        }
    };

    // ------------------------------------------------------------
    // PASSENGERS
    // ------------------------------------------------------------

    const handleAdultCountChange = (
        count: number
    ) => {
        const nextCount = Math.max(
            1,
            Math.min(6, count)
        );

        setAdultCount(nextCount);

        setPassengers(
            (current) => {
                if (
                    nextCount <
                    current.length
                ) {
                    return current.slice(
                        0,
                        nextCount
                    );
                }

                return [
                    ...current,
                    ...Array.from(
                        {
                            length:
                                nextCount -
                                current.length,
                        },
                        createPassenger
                    ),
                ];
            }
        );

        setSeatPrices(
            (current) => {
                const next = {
                    ...current,
                };

                Object.keys(next).forEach(
                    (key) => {
                        const parts =
                            key.split(":");

                        const index =
                            Number(
                                parts[1]
                            );

                        if (
                            Number.isInteger(
                                index
                            ) &&
                            index >=
                            nextCount
                        ) {
                            delete next[key];
                        }
                    }
                );

                return next;
            }
        );
    };

    const handlePassengerChange = (
        index: number,
        field: keyof PassengerRequest,
        value: string
    ) => {
        setPassengers(
            (current) =>
                current.map(
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
                )
        );
    };

    // ------------------------------------------------------------
    // SEATS
    // ------------------------------------------------------------

    const handlePassengerSeatChange = (
        index: number,
        field:
            | "outboundSeatId"
            | "returnSeatId",
        seatId: number | null,
        seat: FlightSeat | null
    ) => {
        setPassengers(
            (current) =>
                current.map(
                    (
                        passenger,
                        passengerIndex
                    ) =>
                        passengerIndex ===
                        index
                            ? {
                                ...passenger,
                                [field]:
                                    seatId ??
                                    (
                                        field ===
                                        "outboundSeatId"
                                            ? 0
                                            : null
                                    ),
                            }
                            : passenger
                )
        );

        const key =
            `${field}:${index}`;

        setSeatPrices(
            (current) => {
                const next = {
                    ...current,
                };

                if (seat) {
                    next[key] =
                        seat.price;
                } else {
                    delete next[key];
                }

                return next;
            }
        );
    };

    const currentSeatClass =
        direction === "RETURN"
            ? returnSeatClass
            : outboundSeatClass;

    const handleSeatClassChange = (
        nextSeatClass: SeatClass
    ) => {
        if (nextSeatClass === currentSeatClass) {
            return;
        }

        if (direction === "RETURN") {
            setReturnSeatClass(nextSeatClass);

            setPassengers((current) =>
                current.map((passenger) => ({
                    ...passenger,
                    returnSeatId: null,
                }))
            );
        } else {
            setOutboundSeatClass(nextSeatClass);

            setPassengers((current) =>
                current.map((passenger) => ({
                    ...passenger,
                    outboundSeatId: 0,
                }))
            );
        }

        const priceKeyPrefix =
            direction === "RETURN"
                ? "returnSeatId:"
                : "outboundSeatId:";

        setSeatPrices((current) => {
            const next = { ...current };
            Object.keys(next)
                .filter((key) => key.startsWith(priceKeyPrefix))
                .forEach((key) => {
                    delete next[key];
                });
            return next;
        });

        setError(null);
    };

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    const validatePassengers =
        (): boolean => {
            const valid =
                passengers.every(
                    (passenger) =>
                        passenger.firstName
                            .trim()
                            .length > 0 &&
                        passenger.lastName
                            .trim()
                            .length > 0 &&
                        passenger.passportNumber
                            .trim()
                            .length > 0 &&
                        passenger.email
                            .trim()
                            .length > 0
                );

            if (!valid) {
                setError(
                    "Please complete all passenger details before continuing."
                );
            }

            return valid;
        };

    const validateSeats = (): boolean => {
        const outboundValid =
            passengers.every(
                (passenger) =>
                    passenger.outboundSeatId >
                    0
            );

        if (!outboundValid) {
            setError(
                "Please select an outbound seat for every passenger."
            );

            return false;
        }

        /*
         * When selecting outbound seats for a round trip,
         * return seats are not required yet.
         */
        if (
            tripType === "ROUND_TRIP" &&
            direction === "OUTBOUND"
        ) {
            setError(null);
            return true;
        }

        /*
         * When selecting return seats, both the return
         * flight and return seats are required.
         */
        if (
            tripType === "ROUND_TRIP" &&
            direction === "RETURN"
        ) {
            if (!returnFlight) {
                setError(
                    "Please select a return flight."
                );

                return false;
            }

            const returnValid =
                passengers.every(
                    (passenger) =>
                        passenger.returnSeatId !==
                        null &&
                        passenger.returnSeatId >
                        0
                );

            if (!returnValid) {
                setError(
                    "Please select a return seat for every passenger."
                );

                return false;
            }
        }

        setError(null);

        return true;
    };

    // ------------------------------------------------------------
    // OUTBOUND → RETURN FLIGHT
    // ------------------------------------------------------------

    const goToReturnFlights = () => {
        if (!validateSeats()) {
            return;
        }

        /*
         * Save the current booking progress before leaving
         * the booking page.
         */
        saveBookingDraft({
            outboundFlight,
            tripType,
            seatClass: outboundSeatClass,
            passengers,
            seatPrices,
            selectingReturn: true,
        });

        navigate("/available", {
            state: {
                returnSelection: true,
                outboundFlight,
                tripType,
                passengers,
                seatClass: outboundSeatClass,
            },
        });
    };

    // ------------------------------------------------------------
    // SEAT CONTINUE
    // ------------------------------------------------------------

    const handleSeatsContinue = () => {
        /*
         * Round trip + outbound seats:
         * go to return-flight selection.
         */
        if (
            tripType === "ROUND_TRIP" &&
            direction === "OUTBOUND"
        ) {
            goToReturnFlights();
            return;
        }

        /*
         * One-way or return seats:
         * validate and go to review.
         */
        if (!validateSeats()) {
            return;
        }

        setError(null);
        setStep("REVIEW");
    };

    // ------------------------------------------------------------
    // BOOK
    // ------------------------------------------------------------

    const handleBook = async () => {
        if (!validateSeats()) {
            return;
        }

        if (
            tripType === "ROUND_TRIP" &&
            !returnFlight
        ) {
            setError(
                "Return flight is missing."
            );

            return;
        }

        setLoading(true);
        setError(null);

        try {
            const bookingRequest: BookingRequest = {
                outboundFlightId:
                outboundFlight.id,
                returnFlightId:
                    returnFlight?.id ?? null,
                passengers,
            };

            const booking =
                await bookFlight(bookingRequest);

            clearBookingDraft();

            navigate("/bookings", {
                state: {
                    booking,
                },
            });
        } catch (error: unknown) {
            if (
                error &&
                typeof error === "object" &&
                "response" in error
            ) {
                const axiosError = error as {
                    response?: {
                        status?: number;
                        data?: {
                            message?: string;
                            error?: string;
                        };
                    };
                };

                const backendMessage =
                    axiosError.response?.data?.message ??
                    axiosError.response?.data?.error;

                setError(
                    backendMessage ??
                    "Unable to complete the booking. Please try again."
                );
            } else {
                setError(
                    "Unable to complete the booking. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------
    // DISCARD BOOKING
    // ------------------------------------------------------------

    const handleDiscard = () => {
        if (onDiscard) {
            onDiscard();
            return;
        }

        clearBookingDraft();

        navigate(
            "/available",
            {
                replace: true,
            }
        );
    };

    // ------------------------------------------------------------
    // TOTAL
    // ------------------------------------------------------------

    const totalPrice =
        Object.values(
            seatPrices
        ).reduce(
            (total, price) =>
                total + price,
            0
        );

    // ------------------------------------------------------------
    // BACK
    // ------------------------------------------------------------

    const handleBack = () => {
        setError(null);

        if (
            step === "PASSENGERS"
        ) {
            setStep("TRIP");
            return;
        }

        if (
            step === "SEATS"
        ) {
            /*
             * If we are selecting return seats,
             * go back to return-flight selection.
             */
            if (
                direction ===
                "RETURN"
            ) {
                navigate(
                    "/available",
                    {
                        state: {
                            returnSelection:
                                true,

                            outboundFlight,

                            tripType,

                            passengers,

                            seatClass: outboundSeatClass,
                        },
                    }
                );

                return;
            }

            setStep("PASSENGERS");
            return;
        }

        if (
            step === "REVIEW"
        ) {
            setStep("SEATS");
        }
    };

    // ------------------------------------------------------------
    // STEP INDICATOR
    // ------------------------------------------------------------

    const steps = [
        {
            id: "TRIP",
            label: "Trip Type",
        },
        {
            id: "PASSENGERS",
            label: "Passengers",
        },
        {
            id: "SEATS",
            label:
                direction ===
                "RETURN"
                    ? "Return Seats"
                    : "Seats",
        },
        {
            id: "REVIEW",
            label: "Review",
        },
    ];

    return (
        <div className="space-y-6">

            {/* Flight summary */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <p className="text-sm text-slate-500">
                            Outbound Flight
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900">
                            {
                                outboundFlight.flightNumber
                            }
                        </h1>

                        <p className="mt-1 text-sm text-slate-600">
                            {
                                outboundFlight.origin.city
                            }{" "}
                            ({outboundFlight.origin.code}){" "}
                            →{" "}
                            {
                                outboundFlight.destination.city
                            }
                            {" "}({outboundFlight.destination.code})
                        </p>
                    </div>

                    {returnFlight && (
                        <div className="border-t pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">

                            <p className="text-sm text-slate-500">
                                Return Flight
                            </p>

                            <h2 className="text-xl font-bold text-slate-900">
                                {
                                    returnFlight.flightNumber
                                }
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                {
                                    returnFlight.origin.city
                                }{" "}
                                ({returnFlight.origin.code}){" "}
                                →{" "}
                                {
                                    returnFlight.destination.city
                                }
                                {" "}({returnFlight.destination.code})
                            </p>

                        </div>
                    )}

                </div>

            </div>

            {/* Steps */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4">

                <div className="grid grid-cols-4 gap-2">

                    {steps.map(
                        (
                            item,
                            index
                        ) => {
                            const active =
                                item.id ===
                                step;

                            return (
                                <div
                                    key={
                                        item.id
                                    }
                                    className={`rounded-lg px-2 py-3 text-center text-xs font-semibold sm:text-sm ${
                                        active
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <span>
                                        {
                                            index +
                                            1
                                        }
                                    </span>

                                    <span className="ml-1 hidden sm:inline">
                                        {
                                            item.label
                                        }
                                    </span>
                                </div>
                            );
                        }
                    )}

                </div>

            </div>

            {/* Error */}

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            {/* Trip */}

            {step ===
                "TRIP" && (
                    <>
                        <TripTypeStep
                            tripType={
                                tripType
                            }
                            onTripTypeChange={
                                handleTripTypeChange
                            }
                        />

                        <div className="flex justify-end">

                            <Button
                                onClick={() => {
                                    setError(
                                        null
                                    );

                                    setStep(
                                        "PASSENGERS"
                                    );
                                }}
                            >
                                Continue
                            </Button>

                        </div>
                    </>
                )}

            {/* Passengers */}

            {step ===
                "PASSENGERS" && (
                    <>
                        <PassengerStep
                            passengers={
                                passengers
                            }
                            adultCount={
                                adultCount
                            }
                            onAdultCountChange={
                                handleAdultCountChange
                            }
                            onPassengerChange={
                                handlePassengerChange
                            }
                        />

                        <div className="flex justify-between">

                            <button
                                type="button"
                                onClick={
                                    handleBack
                                }
                                className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold"
                            >
                                Back
                            </button>

                            <Button
                                onClick={() => {
                                    if (
                                        validatePassengers()
                                    ) {
                                        setError(
                                            null
                                        );

                                        setStep(
                                            "SEATS"
                                        );

                                        setDirection(
                                            "OUTBOUND"
                                        );
                                    }
                                }}
                            >
                                Continue to Seats
                            </Button>

                        </div>
                    </>
                )}

            {/* Seats */}

            {step ===
                "SEATS" && (
                    <>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Seat Class
                                    </p>

                                    <select
                                        value={
                                            currentSeatClass
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleSeatClassChange(
                                                event.target.value as SeatClass
                                            )
                                        }
                                        className="mt-1 rounded-lg border border-slate-300 px-3 py-2 font-semibold"
                                    >
                                        <option value="ECONOMY">
                                            Economy
                                        </option>

                                        <option value="PREMIUM_ECONOMY">
                                            Premium Economy
                                        </option>

                                        <option value="BUSINESS">
                                            Business
                                        </option>

                                        <option value="FIRST_CLASS">
                                            First Class
                                        </option>
                                    </select>

                                </div>

                                <div className="text-sm text-slate-500">
                                    {direction ===
                                    "RETURN"
                                        ? "Select seats for your return flight."
                                        : tripType ===
                                        "ROUND_TRIP"
                                            ? "Select outbound seats first."
                                            : "Select your seats."}
                                </div>

                            </div>

                        </div>

                        <SeatsStep
                            flight={
                                outboundFlight
                            }
                            returnFlight={
                                returnFlight
                            }
                            tripType={
                                tripType
                            }
                            seatClass={
                                currentSeatClass
                            }
                            passengers={
                                passengers
                            }
                            direction={
                                direction
                            }
                            onPassengerSeatChange={
                                handlePassengerSeatChange
                            }
                            onContinue={
                                handleSeatsContinue
                            }
                        />

                        <div className="flex items-center justify-between">

                            <button
                                type="button"
                                onClick={
                                    handleBack
                                }
                                className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDiscard
                                }
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Cancel Booking
                            </button>

                        </div>
                    </>
                )}

            {/* Review */}

            {step ===
                "REVIEW" && (
                    <div className="space-y-6">

                        <div className="rounded-2xl border border-slate-200 bg-white p-6">

                            <h2 className="text-2xl font-bold text-slate-900">
                                Review Booking
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Check everything before confirming your booking.
                            </p>

                        </div>

                        {/* Flights */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6">

                            <h3 className="font-bold text-slate-900">
                                Flights
                            </h3>

                            <div className="mt-4 space-y-4">

                                <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="font-semibold">
                                        Outbound
                                    </p>

                                    <p className="text-sm text-slate-600">
                                        {
                                            outboundFlight.flightNumber
                                        }{" "}
                                        ·{" "}
                                        {
                                            outboundFlight.origin.code
                                        }{" "}
                                        →{" "}
                                        {
                                            outboundFlight.destination.code
                                        }
                                    </p>

                                </div>

                                {returnFlight && (
                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="font-semibold">
                                            Return
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            {
                                                returnFlight.flightNumber
                                            }{" "}
                                            ·{" "}
                                            {
                                                returnFlight.origin.code
                                            }{" "}
                                            →{" "}
                                            {
                                                returnFlight.destination.code
                                            }
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* Passengers */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6">

                            <h3 className="font-bold text-slate-900">
                                Passengers
                            </h3>

                            <div className="mt-4 divide-y">

                                {passengers.map(
                                    (
                                        passenger,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="py-4 first:pt-0 last:pb-0"
                                        >

                                            <p className="font-semibold">
                                                Adult{" "}
                                                {
                                                    index +
                                                    1
                                                }
                                            </p>

                                            <p className="text-sm text-slate-600">
                                                {
                                                    passenger.firstName
                                                }{" "}
                                                {
                                                    passenger.lastName
                                                }
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                {
                                                    passenger.email
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Outbound
                                                seat:{" "}
                                                {
                                                    passenger.outboundSeatId
                                                }

                                                {tripType ===
                                                    "ROUND_TRIP" &&
                                                    ` · Return seat: ${passenger.returnSeatId}`}
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                        {/* Price */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6">

                            <div className="flex items-center justify-between">

                            <span className="text-lg font-semibold text-slate-700">
                                Total
                            </span>

                            <span className="text-3xl font-bold text-blue-600">
                                {new Intl.NumberFormat("sv-SE", {
                                    style: "currency",
                                    currency: "SEK",
                                }).format(totalPrice)}
                            </span>

                            </div>

                        </div>

                        <div className="flex items-center justify-between">

                            <button
                                type="button"
                                onClick={
                                    handleBack
                                }
                                disabled={
                                    loading
                                }
                                className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold disabled:opacity-50"
                            >
                                Back
                            </button>

                            <div className="flex items-center gap-4">

                                <button
                                    type="button"
                                    onClick={
                                        handleDiscard
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                >
                                    Discard Draft
                                </button>

                                <Button
                                    onClick={
                                        handleBook
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    {loading
                                        ? "Booking..."
                                        : "Confirm & Book"}
                                </Button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default BookingForm;
