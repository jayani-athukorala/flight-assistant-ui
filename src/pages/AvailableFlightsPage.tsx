import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plane,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import FlightGrid from "../components/flights/FlightGrid";
import FlightSearchModal from "../components/flights/FlightSearchModal";
import { getAvailableFlights } from "../services/flightService";
import type { Airport } from "../types/Airport";
import type { Flight, SeatClass } from "../types/Flight";
import type { PassengerRequest, TripType } from "../types/Booking";

interface AvailableFlightsNavigationState {
    originId?: number;
    destinationId?: number;
    origin?: Airport;
    destination?: Airport;
    openSearch?: boolean;
    searchRequestId?: number;
    searchDate?: string;
    outboundFlight?: Flight;
    tripType?: TripType;
    passengers?: PassengerRequest[];
    seatClass?: SeatClass;
}

interface FlightLoadResult {
    routeKey: string | null;
    flights: Flight[];
    error: string | null;
}

const formatDateValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const dateFromValue = (value: string): Date =>
    new Date(`${value}T00:00:00`);

const addDays = (date: Date, amount: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
};

const startOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
    result.setHours(0, 0, 0, 0);
    return result;
};

const airportLabel = (airport: Airport): string =>
    `${airport.city} (${airport.code})`;

const AvailableFlightsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const navigationState =
        location.state as AvailableFlightsNavigationState | null;

    const outboundFlight = navigationState?.outboundFlight;
    const isReturnSelection = Boolean(outboundFlight);

    const originId =
        outboundFlight?.destination.id ?? navigationState?.originId;
    const destinationId =
        outboundFlight?.origin.id ?? navigationState?.destinationId;

    const hasRoute =
        originId !== undefined &&
        destinationId !== undefined &&
        originId !== destinationId;

    const minimumDateValue = outboundFlight
        ? formatDateValue(addDays(new Date(outboundFlight.arrivalTime), 1))
        : formatDateValue(new Date());

    const initialDate = dateFromValue(minimumDateValue);
    const routeKey = hasRoute ? `${originId}-${destinationId}` : null;

    const [loadResult, setLoadResult] = useState<FlightLoadResult>({
        routeKey: null,
        flights: [],
        error: null,
    });
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [weekStart, setWeekStart] = useState(() =>
        startOfWeek(initialDate)
    );
    const [filter, setFilter] = useState("");
    const [calendarOpen, setCalendarOpen] = useState(false);

    const [modalRequested, setModalRequested] = useState(false);
    const searchModalOpen =
        !hasRoute ||
        modalRequested ||
        navigationState?.openSearch === true;

    const loading = routeKey !== null && loadResult.routeKey !== routeKey;
    const flights = useMemo(
        () =>
            loadResult.routeKey === routeKey ? loadResult.flights : [],
        [loadResult.flights, loadResult.routeKey, routeKey]
    );
    const error =
        loadResult.routeKey === routeKey ? loadResult.error : null;

    useEffect(() => {
        if (!routeKey || originId === undefined || destinationId === undefined) {
            return;
        }

        let active = true;

        void getAvailableFlights({ originId, destinationId })
            .then((data) => {
                if (!active) return;

                // Keep this client-side check as a safeguard. The backend
                // endpoint should apply the same origin/destination ID filter.
                const routeFlights = data.filter(
                    (flight) =>
                        flight.origin.id === originId &&
                        flight.destination.id === destinationId
                );

                const eligibleFlights = outboundFlight
                    ? routeFlights.filter(
                        (flight) =>
                            new Date(flight.departureTime) >
                            new Date(outboundFlight.arrivalTime)
                    )
                    : routeFlights;

                setLoadResult({
                    routeKey,
                    flights: eligibleFlights,
                    error: null,
                });

                const requestedDate = navigationState?.searchDate;
                const requestedDateIsValid =
                    Boolean(requestedDate) &&
                    requestedDate! >= minimumDateValue;
                const requestedDateHasFlights =
                    requestedDateIsValid &&
                    eligibleFlights.some(
                        (flight) =>
                            flight.departureTime.slice(0, 10) === requestedDate
                    );

                const firstDate =
                    (requestedDateHasFlights ? requestedDate : null) ??
                    eligibleFlights[0]?.departureTime.slice(0, 10) ??
                    minimumDateValue;
                const nextDate = dateFromValue(firstDate);
                setSelectedDate(nextDate);
                setWeekStart(startOfWeek(nextDate));
            })
            .catch((requestError: unknown) => {
                if (!active) return;
                console.error("Failed to load available flights", requestError);
                setLoadResult({
                    routeKey,
                    flights: [],
                    error: "Unable to load flights for the selected route.",
                });
            });

        return () => {
            active = false;
        };
    }, [destinationId, minimumDateValue, navigationState?.searchDate, originId, outboundFlight, routeKey]);

    const selectedDateValue = formatDateValue(selectedDate);
    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
        [weekStart]
    );
    const availableDates = useMemo(
        () =>
            new Set(
                flights.map((flight) =>
                    flight.departureTime.slice(0, 10)
                )
            ),
        [flights]
    );

    const filteredFlights = useMemo(() => {
        const term = filter.trim().toLowerCase();

        return flights.filter((flight) => {
            const matchesDate =
                flight.departureTime.slice(0, 10) === selectedDateValue;

            if (!matchesDate) return false;
            if (!term) return true;

            const searchableValues = [
                flight.flightNumber,
                flight.airline,
                flight.origin.code,
                flight.origin.city,
                flight.origin.name,
                flight.origin.country,
                flight.destination.code,
                flight.destination.city,
                flight.destination.name,
                flight.destination.country,
            ];

            return searchableValues.some((value) =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(term)
            );
        });
    }, [filter, flights, selectedDateValue]);

    const averagePrice = useMemo(() => {
        const prices = filteredFlights.flatMap((flight) => {
            if (
                flight.startingPrice === null ||
                flight.startingPrice === undefined
            ) {
                return [];
            }

            const price = Number(flight.startingPrice);
            return Number.isFinite(price) ? [price] : [];
        });

        if (prices.length === 0) return null;

        return prices.reduce((total, price) => total + price, 0) /
            prices.length;
    }, [filteredFlights]);

    const firstFlight = flights[0];
    const originDisplay = navigationState?.origin
        ? airportLabel(navigationState.origin)
        : firstFlight
            ? airportLabel(firstFlight.origin)
            : originId !== undefined
                ? `Airport #${originId}`
                : "Choose origin";
    const destinationDisplay = navigationState?.destination
        ? airportLabel(navigationState.destination)
        : firstFlight
            ? airportLabel(firstFlight.destination)
            : destinationId !== undefined
                ? `Airport #${destinationId}`
                : "Choose destination";

    const handleRouteSearch = (
        origin: Airport,
        destination: Airport,
        departureDate: string
    ) => {
        setModalRequested(false);
        navigate("/available", {
            state: {
                originId: origin.id,
                destinationId: destination.id,
                origin,
                destination,
                searchDate: departureDate,
                openSearch: false,
            },
            replace: true,
        });
    };

    const closeSearchModal = () => {
        if (!hasRoute) {
            navigate("/");
            return;
        }

        setModalRequested(false);

        if (navigationState?.openSearch) {
            navigate("/available", {
                state: {
                    ...navigationState,
                    openSearch: false,
                },
                replace: true,
            });
        }
    };

    const selectFlight = (flight: Flight) => {
        if (isReturnSelection && outboundFlight) {
            navigate(`/booking/${outboundFlight.id}`, {
                state: {
                    returnBooking: true,
                    outboundFlight,
                    returnFlight: flight,
                    tripType: "ROUND_TRIP",
                    passengers: navigationState?.passengers,
                    seatClass: navigationState?.seatClass,
                },
            });
            return;
        }

        navigate(`/booking/${flight.id}`, {
            state: { outboundFlight: flight, tripType: "ONE_WAY" },
        });
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
                    <div className="bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.45),transparent_50%)] px-6 py-8 sm:px-9">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                                    <Plane size={16} />
                                    {isReturnSelection
                                        ? "Return journey"
                                        : "Available flights"}
                                </p>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        {originDisplay}
                                    </h1>
                                    <ArrowRight className="text-blue-300" size={24} />
                                    <h2 className="text-2xl font-bold sm:text-3xl">
                                        {destinationDisplay}
                                    </h2>
                                </div>
                                <p className="mt-4 text-sm text-slate-300">
                                    Select a date and compare available flights.
                                </p>
                            </div>

                            {!isReturnSelection && hasRoute && (
                                <button
                                    type="button"
                                    onClick={() => setModalRequested(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-blue-50"
                                >
                                    <SlidersHorizontal size={18} />
                                    Change route
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {!hasRoute ? (
                    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <Plane className="mx-auto text-slate-300" size={38} />
                        <h2 className="mt-4 text-xl font-bold text-slate-950">
                            Choose your route
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Select departure and destination airports to continue.
                        </p>
                        <button
                            type="button"
                            onClick={() => setModalRequested(true)}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            <Search size={18} />
                            Choose airports
                        </button>
                    </section>
                ) : (
                    <>
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 font-bold text-slate-950">
                                        <CalendarDays className="text-blue-600" size={20} />
                                        {isReturnSelection ? "Select return date" : "Select departure date"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {isReturnSelection
                                            ? "Choose a return date after your outbound flight arrives."
                                            : "Blue dots indicate dates with available flights."}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCalendarOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                                >
                                    <CalendarDays size={17} />
                                    Full calendar
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setWeekStart((value) => addDays(value, -7))
                                    }
                                    aria-label="Previous week"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:bg-blue-50"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="grid min-w-0 flex-1 grid-cols-4 gap-2 overflow-x-auto sm:grid-cols-7">
                                    {weekDays.map((date) => {
                                        const value = formatDateValue(date);
                                        const selected = value === selectedDateValue;
                                        const beforeMinimum = value < minimumDateValue;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                disabled={beforeMinimum}
                                                onClick={() => setSelectedDate(date)}
                                                className={`relative min-w-[78px] rounded-xl border px-2 py-3 text-center transition ${
                                                    selected
                                                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                                                        : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                                } ${beforeMinimum ? "opacity-40" : ""}`}
                                            >
                                                <span className="block text-xs font-semibold uppercase opacity-75">
                                                    {date.toLocaleDateString("en-GB", {
                                                        weekday: "short",
                                                    })}
                                                </span>
                                                <span className="mt-1 block text-sm font-bold">
                                                    {date.toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                                {availableDates.has(value) && (
                                                    <span
                                                        className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                                                            selected
                                                                ? "bg-white"
                                                                : "bg-blue-600"
                                                        }`}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setWeekStart((value) => addDays(value, 7))
                                    }
                                    aria-label="Next week"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:bg-blue-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </section>

                        <section className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Available flights</p>
                                <p className="mt-2 text-3xl font-bold text-blue-600">
                                    {filteredFlights.length}
                                </p>
                            </div>
                            <div className="rounded-2xl border bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Average price</p>
                                <p className="mt-2 text-3xl font-bold text-emerald-600">
                                    {averagePrice === null
                                        ? "Price unavailable"
                                        : new Intl.NumberFormat("en-IE", {
                                            style: "currency",
                                            currency: "EUR",
                                        }).format(averagePrice)}
                                </p>
                            </div>
                            <div className="rounded-2xl border bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Selected date</p>
                                <p className="mt-2 text-lg font-bold text-slate-950">
                                    {selectedDate.toLocaleDateString("en-GB", {
                                        dateStyle: "medium",
                                    })}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-white p-5 shadow-sm">
                            <label
                                htmlFor="flight-filter"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Filter flights
                            </label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <input
                                    id="flight-filter"
                                    value={filter}
                                    onChange={(event) => setFilter(event.target.value)}
                                    placeholder="Flight number, airline, city or airport code"
                                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </section>

                        {loading && (
                            <section className="rounded-2xl border bg-white p-14 text-center">
                                <Loader2
                                    className="mx-auto animate-spin text-blue-600"
                                    size={34}
                                />
                                <p className="mt-4 font-semibold text-slate-700">
                                    Loading available flights…
                                </p>
                            </section>
                        )}

                        {!loading && error && (
                            <section className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
                                <p className="font-semibold">{error}</p>
                            </section>
                        )}

                        {!loading && !error && filteredFlights.length === 0 && (
                            <section className="rounded-2xl border border-dashed bg-white p-12 text-center">
                                <Plane className="mx-auto text-slate-300" size={38} />
                                <h2 className="mt-4 text-xl font-bold">
                                    No flights available
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try another date or update your filter.
                                </p>
                            </section>
                        )}

                        {!loading && !error && filteredFlights.length > 0 && (
                            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
                                <FlightGrid
                                    flights={filteredFlights}
                                    onSelectFlight={selectFlight}
                                />
                            </section>
                        )}
                    </>
                )}
            </div>

            {calendarOpen && (
                <div
                    role="presentation"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setCalendarOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="calendar-title"
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h2 id="calendar-title" className="text-xl font-bold">
                                    Select departure date
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {isReturnSelection
                                        ? "Return dates before the outbound arrival are disabled."
                                        : "Choose an available travel date."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCalendarOpen(false)}
                                aria-label="Close calendar"
                                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={19} />
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (!date) return;
                                    setSelectedDate(date);
                                    setWeekStart(startOfWeek(date));
                                    setCalendarOpen(false);
                                }}
                                disabled={{ before: dateFromValue(minimumDateValue) }}
                                modifiers={{
                                    available: (date) =>
                                        availableDates.has(formatDateValue(date)),
                                }}
                                modifiersClassNames={{
                                    available: "font-bold text-blue-700",
                                }}
                                showOutsideDays
                            />
                        </div>
                    </div>
                </div>
            )}

            <FlightSearchModal
                open={searchModalOpen}
                initialOrigin={
                    outboundFlight?.destination ??
                    navigationState?.origin ??
                    null
                }
                initialDestination={
                    outboundFlight?.origin ??
                    navigationState?.destination ??
                    null
                }
                onClose={closeSearchModal}
                onSearch={handleRouteSearch}
            />
        </PageContainer>
    );
};

export default AvailableFlightsPage;