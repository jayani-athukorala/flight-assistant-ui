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
    compact?: boolean;
    onSeatClassChange?: (seatClass: SeatClass) => void;

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
    currency: "SEK",
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
                       compact = false,
                       onSeatClassChange,
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
        <div className={compact ? "space-y-3" : "space-y-6"}>
            {/* Header */}
            <div className={`border border-slate-200 bg-white shadow-sm ${compact ? "rounded-xl p-3" : "rounded-2xl p-6"}`}>
                <div className={compact ? "space-y-2" : "flex flex-col gap-4 md:flex-row md:items-center md:justify-between"}>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                            {isReturnDirection
                                ? "Return Flight"
                                : "Outbound Flight"}
                        </p>

                        <h2 className={`mt-1 font-bold text-slate-900 ${compact ? "text-base" : "text-2xl"}`}>
                            Choose your {seatClass.toLowerCase()} seat
                        </h2>

                        <p className={`mt-1 text-slate-500 ${compact ? "text-xs" : "text-sm"}`}>
                            {isReturnDirection && returnFlight
                                ? flightRouteLabel(returnFlight)
                                : flightRouteLabel(flight)}
                        </p>
                    </div>

                    <div className={compact ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
                        {onSeatClassChange && (
                            <label className={`font-semibold text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
                                Seat class
                                <select
                                    value={seatClass}
                                    onChange={(event) => onSeatClassChange(event.target.value as SeatClass)}
                                    className={`ml-2 border border-slate-300 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${compact ? "rounded-md px-2 py-1.5 text-xs" : "rounded-lg px-3 py-2 text-sm"}`}
                                >
                                    <option value="ECONOMY">Economy</option>
                                    <option value="PREMIUM_ECONOMY">Premium economy</option>
                                    <option value="BUSINESS">Business</option>
                                    <option value="FIRST_CLASS">First class</option>
                                </select>
                            </label>
                        )}

                        <div className={`flex items-center gap-2 bg-slate-100 text-slate-700 ${compact ? "w-fit rounded-lg px-2.5 py-1.5 text-xs" : "rounded-xl px-4 py-3 text-sm"}`}>
                            <Users size={17} />
                            Passenger <span className="font-bold">{activePassenger + 1}</span>
                            of <span className="font-bold">{passengers.length}</span>
                        </div>
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
                                className={`${compact ? "rounded-md px-2.5 py-1.5 text-xs" : "rounded-lg px-4 py-2 text-sm"} font-semibold ${
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
                <div className={`flex items-center justify-center bg-white shadow-sm ${compact ? "rounded-xl p-6" : "rounded-2xl p-12"}`}>
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
                    <div className={`bg-red-50 text-red-700 ${compact ? "rounded-xl p-3 text-sm" : "rounded-2xl p-6"}`}>
                        {currentError}
                    </div>
                )}

            {/* Seats */}
            {!currentLoading &&
                !currentError && (
                    <div className={`border border-slate-200 bg-white shadow-sm ${compact ? "rounded-xl p-3" : "rounded-2xl p-6"}`}>
                        <div className={`flex flex-wrap text-slate-600 ${compact ? "mb-3 gap-2 text-xs" : "mb-6 gap-4 text-sm"}`}>
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
                            <div className={`border-2 border-slate-200 bg-slate-50 ${compact ? "rounded-xl p-2" : "rounded-[2rem] p-4 sm:p-6"}`}>
                                <div className={`flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-slate-400 ${compact ? "mb-3 text-[10px]" : "mb-6 text-xs"}`}>
                                    <Plane size={15} /> Front of aircraft
                                </div>

                                <div className={compact ? "grid grid-cols-3 gap-2" : "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"}>
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
                                                    className={`${compact ? "rounded-lg p-2" : "rounded-xl p-3"} border text-center transition ${
                                                        taken
                                                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                            : selected
                                                                ? "border-blue-600 bg-blue-600 text-white shadow-md"
                                                                : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                                                    }`}
                                                >
                                                    <Armchair className={`mx-auto ${compact ? "h-4 w-4" : "h-5 w-5"}`} />

                                                    <p className={`mt-1 font-bold ${compact ? "text-xs" : "text-sm"}`}>
                                                        {
                                                            seat.seatNumber
                                                        }
                                                    </p>

                                                    <p className={compact ? "text-[10px]" : "text-xs"}>
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
                            <div className={`${compact ? "mt-3 rounded-lg p-2.5 text-xs" : "mt-6 rounded-xl p-4"} bg-blue-50 text-blue-800`}>
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
            <div className={`flex justify-between ${compact ? "gap-2" : ""}`}>
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
                    className={`${compact ? "px-3 py-2 text-xs" : "px-5 py-2.5"} rounded-lg border border-slate-300 font-semibold disabled:cursor-not-allowed disabled:opacity-40`}
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
                    className={`${compact ? "px-3 py-2 text-xs" : "px-5 py-2.5"} rounded-lg bg-blue-600 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40`}
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
