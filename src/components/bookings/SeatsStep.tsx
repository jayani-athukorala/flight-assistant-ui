import {
    useEffect,
    useState,
} from "react";

import {
    Armchair,
    Check,
    Loader2,
    Plane,
    Users,
} from "lucide-react";

import {
    getAvailableSeats,
} from "../../services/flightService";

import type {
    Flight,
    FlightSeat,
    SeatClass,
} from "../../types/Flight";

import type {
    PassengerRequest,
    TripType,
} from "../../types/Booking";

type Direction =
    | "OUTBOUND"
    | "RETURN";

interface SeatsStepProps {
    flight: Flight;
    returnFlight?: Flight;
    tripType: TripType;
    seatClass: SeatClass;
    passengers: PassengerRequest[];

    direction?: Direction;

    onPassengerSeatChange: (
        passengerIndex: number,
        field:
            | "outboundSeatId"
            | "returnSeatId",
        seatId: number | null,
        seat: FlightSeat | null
    ) => void;

    onContinue: () => void;
    continueLabel?: string;
}

interface SeatLoadResult {
    key: string;
    seats: FlightSeat[];
    error: string | null;
}

const priceFormatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
});

const flightRouteLabel = (flight: Flight): string =>
    `${flight.flightNumber} · ${flight.origin.code} → ${flight.destination.code}`;

const SeatsStep = ({
                       flight,
                       returnFlight,
                       tripType,
                       seatClass,
                       passengers,
                       direction = "OUTBOUND",
                       onPassengerSeatChange,
                       onContinue,
                       continueLabel,
                   }: SeatsStepProps) => {
    const [activePassenger, setActivePassenger] =
        useState(0);

    const [seatResult, setSeatResult] =
        useState<SeatLoadResult | null>(null);

    const isReturnDirection =
        direction === "RETURN";

    const activeFlight =
        isReturnDirection
            ? returnFlight
            : flight;

    const requestKey = activeFlight
        ? `${activeFlight.id}:${seatClass}`
        : null;

    useEffect(() => {
        if (!activeFlight || !requestKey) {
            return;
        }

        let cancelled = false;

        void getAvailableSeats(
            activeFlight.id,
            seatClass
        )
            .then((seats) => {
                if (cancelled) return;

                setSeatResult({
                    key: requestKey,
                    seats,
                    error: null,
                });
            })
            .catch(() => {
                if (cancelled) return;

                setSeatResult({
                    key: requestKey,
                    seats: [],
                    error: isReturnDirection
                        ? "Unable to load return seats."
                        : "Unable to load outbound seats.",
                });
            });

        return () => {
            cancelled = true;
        };
    }, [
        activeFlight,
        isReturnDirection,
        requestKey,
        seatClass,
    ]);

    const currentData =
        requestKey &&
        seatResult?.key === requestKey
            ? seatResult
            : null;

    const currentSeats =
        currentData?.seats ?? [];

    const currentLoading =
        Boolean(requestKey && !currentData);

    const currentError =
        currentData?.error ?? null;

    const currentPassenger =
        passengers[activePassenger];

    if (!currentPassenger) {
        return null;
    }

    if (
        isReturnDirection &&
        !returnFlight
    ) {
        return (
            <div className="rounded-2xl bg-red-50 p-6 text-red-700">
                Return flight information is missing.
            </div>
        );
    }

    // ------------------------------------------------------------
    // SELECTED SEATS BY OTHER PASSENGERS
    // ------------------------------------------------------------

    const selectedByOthers = new Set<number>();

    passengers.forEach(
        (passenger, index) => {
            if (
                index ===
                activePassenger
            ) {
                return;
            }

            if (isReturnDirection) {
                if (
                    passenger.returnSeatId &&
                    passenger.returnSeatId > 0
                ) {
                    selectedByOthers.add(
                        passenger.returnSeatId
                    );
                }
            } else {
                if (
                    passenger.outboundSeatId >
                    0
                ) {
                    selectedByOthers.add(
                        passenger.outboundSeatId
                    );
                }
            }
        }
    );

    const selectedSeatId =
        isReturnDirection
            ? currentPassenger.returnSeatId
            : currentPassenger.outboundSeatId;

    const selectedSeat =
        currentSeats.find(
            (seat) =>
                seat.id === selectedSeatId
        );

    const field =
        isReturnDirection
            ? "returnSeatId"
            : "outboundSeatId";

    const seatsComplete = passengers.every(
        (passenger) => {
            const seatId =
                isReturnDirection
                    ? passenger.returnSeatId
                    : passenger.outboundSeatId;

            return (
                seatId !== null &&
                seatId > 0
            );
        }
    );

    const handleSeatClick = (
        seat: FlightSeat
    ) => {
        if (
            selectedByOthers.has(seat.id)
        ) {
            return;
        }

        if (
            selectedSeatId === seat.id
        ) {
            onPassengerSeatChange(
                activePassenger,
                field,
                null,
                null
            );

            return;
        }

        onPassengerSeatChange(
            activePassenger,
            field,
            seat.id,
            seat
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                            {isReturnDirection
                                ? "Return Flight"
                                : "Outbound Flight"}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            Choose your {seatClass.toLowerCase()} seat
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isReturnDirection && returnFlight
                                ? flightRouteLabel(returnFlight)
                                : flightRouteLabel(flight)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                        <Users size={17} />
                        Passenger{" "}
                        <span className="font-bold">
                            {activePassenger + 1}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold">
                            {passengers.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Passenger tabs */}
            <div className="flex flex-wrap gap-2">
                {passengers.map(
                    (passenger, index) => {
                        const passengerSeat =
                            isReturnDirection
                                ? passenger.returnSeatId
                                : passenger.outboundSeatId;

                        const hasSeat =
                            passengerSeat !== null &&
                            passengerSeat > 0;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() =>
                                    setActivePassenger(
                                        index
                                    )
                                }
                                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                    activePassenger ===
                                    index
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-slate-700 ring-1 ring-slate-200"
                                }`}
                            >
                                {passenger.firstName.trim() || `Passenger ${index + 1}`}

                                {hasSeat && <Check className="inline-block h-4 w-4" />}
                            </button>
                        );
                    }
                )}
            </div>

            {/* Loading */}
            {currentLoading && (
                <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

                        <p className="mt-3 font-semibold text-slate-800">
                            Loading seats...
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {!currentLoading &&
                currentError && (
                    <div className="rounded-2xl bg-red-50 p-6 text-red-700">
                        {currentError}
                    </div>
                )}

            {/* Seats */}
            {!currentLoading &&
                !currentError && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Armchair className="h-4 w-4" />
                                Available
                            </div>

                            <div className="font-semibold text-blue-600">
                                Selected
                            </div>

                            <div className="text-slate-400">
                                Assigned to another passenger
                            </div>
                        </div>

                        {currentSeats.length ===
                        0 ? (
                            <div className="rounded-xl bg-slate-50 p-8 text-center">
                                <p className="font-semibold text-slate-800">
                                    No seats available
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border-2 border-slate-200 bg-slate-50 p-4 sm:p-6">
                                <div className="mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <Plane size={15} /> Front of aircraft
                                </div>

                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                    {currentSeats.map(
                                        (seat) => {
                                            const taken =
                                                selectedByOthers.has(
                                                    seat.id
                                                );

                                            const selected =
                                                selectedSeatId ===
                                                seat.id;

                                            return (
                                                <button
                                                    key={
                                                        seat.id
                                                    }
                                                    type="button"
                                                    disabled={
                                                        taken
                                                    }
                                                    onClick={() =>
                                                        handleSeatClick(
                                                            seat
                                                        )
                                                    }
                                                    className={`rounded-xl border p-3 text-center transition ${
                                                        taken
                                                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                            : selected
                                                                ? "border-blue-600 bg-blue-600 text-white shadow-md"
                                                                : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                                                    }`}
                                                >
                                                    <Armchair className="mx-auto h-5 w-5" />

                                                    <p className="mt-1 text-sm font-bold">
                                                        {
                                                            seat.seatNumber
                                                        }
                                                    </p>

                                                    <p className="text-xs">
                                                        {priceFormatter.format(seat.price)}
                                                    </p>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedSeat && (
                            <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-800">
                                Selected seat:{" "}
                                <strong>
                                    {
                                        selectedSeat.seatNumber
                                    }
                                </strong>{" "}
                                — {priceFormatter.format(selectedSeat.price)}
                            </div>
                        )}
                    </div>
                )}

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    type="button"
                    disabled={
                        activePassenger === 0
                    }
                    onClick={() =>
                        setActivePassenger(
                            (current) =>
                                Math.max(
                                    0,
                                    current - 1
                                )
                        )
                    }
                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <button
                    type="button"
                    onClick={() => {
                        if (
                            activePassenger <
                            passengers.length - 1
                        ) {
                            setActivePassenger(
                                (current) =>
                                    current + 1
                            );
                            return;
                        }

                        onContinue();
                    }}
                    disabled={
                        activePassenger ===
                        passengers.length -
                        1 &&
                        !seatsComplete
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {activePassenger <
                    passengers.length - 1
                        ? "Next Passenger"
                        : continueLabel ?? (isReturnDirection
                            ? "Review Booking"
                            : tripType ===
                            "ROUND_TRIP"
                                ? "Select Return Flight"
                                : "Review Booking")}
                </button>
            </div>
        </div>
    );
};

export default SeatsStep;