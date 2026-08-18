import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import SearchInput from "../components/common/SearchInput";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/flights/EmptyState";
import CardSkeletonGrid from "../components/common/CardSkeletonGrid";

import FlightGrid from "../components/flights/FlightGrid";
import { getAvailableFlights } from "../api/flightService";
import type { Flight } from "../types/Flight";

const AvailableFlightsPage = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Selected flight date
    const [selectedDate, setSelectedDate] = useState<Date>(
        new Date()
    );

    // Date shown at the beginning of the weekly strip
    const [weekStart, setWeekStart] = useState<Date>(
        getStartOfWeek(new Date())
    );

    // Full calendar modal
    const [calendarOpen, setCalendarOpen] = useState(false);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const data = await getAvailableFlights();
                setFlights(data);
            } catch (error) {
                console.error(
                    "Failed to load available flights",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchFlights();
    }, []);

    /**
     * Returns Monday of the week containing the date.
     */
    function getStartOfWeek(date: Date): Date {
        const result = new Date(date);
        const day = result.getDay();

        // Convert Sunday = 0 to Monday-based week
        const diff = day === 0 ? -6 : 1 - day;

        result.setDate(result.getDate() + diff);
        result.setHours(0, 0, 0, 0);

        return result;
    }

    /**
     * Format Date -> YYYY-MM-DD
     */
    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /**
     * Add days to a date without mutating the original.
     */
    function addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);

        return result;
    }

    /**
     * Move the weekly strip by one week.
     */
    function changeWeek(amount: number) {
        const newWeekStart = addDays(
            weekStart,
            amount * 7
        );

        setWeekStart(newWeekStart);
    }

    /**
     * Select a date.
     *
     * Also moves the weekly strip so the selected date
     * is visible if it is outside the current week.
     */
    function handleDateSelect(date: Date | undefined) {
        if (!date) {
            return;
        }

        setSelectedDate(date);
        setWeekStart(getStartOfWeek(date));
        setCalendarOpen(false);
    }

    /**
     * Seven dates displayed in the weekly strip.
     */
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) =>
            addDays(weekStart, index)
        );
    }, [weekStart]);

    /**
     * Only flights that are genuinely available for booking.
     *
     * A flight is available when:
     * 1. Its status is AVAILABLE
     * 2. Its departure time has not passed
     */
    const trulyAvailableFlights = useMemo(() => {
        const now = Date.now();

        return flights.filter((flight) => {
            const status = (
                flight.status ?? "AVAILABLE"
            ).toUpperCase();

            const departureTime = new Date(
                flight.departureTime
            ).getTime();

            return (
                status === "AVAILABLE" &&
                departureTime > now
            );
        });
    }, [flights]);

    /**
     * Dates that have genuinely available flights.
     */
    const availableDates = useMemo(() => {
        return new Set(
            trulyAvailableFlights.map(
                (flight) =>
                    flight.departureTime.slice(0, 10)
            )
        );
    }, [trulyAvailableFlights]);

    /**
     * Filter flights based on selected date + search.
     */
    const filteredFlights = useMemo(() => {
        const term = search.trim().toLowerCase();
        const selectedDateString =
            formatDate(selectedDate);

        return trulyAvailableFlights.filter((flight) => {
            const flightDate =
                flight.departureTime.slice(0, 10);

            const matchesDate =
                flightDate === selectedDateString;

            const matchesSearch =
                flight.flightNumber
                    .toLowerCase()
                    .includes(term) ||
                flight.destination
                    .toLowerCase()
                    .includes(term);

            return matchesDate && matchesSearch;
        });
    }, [
        trulyAvailableFlights,
        search,
        selectedDate,
    ]);

    /**
     * Average price for the selected date.
     */
    const averagePrice =
        filteredFlights.length > 0
            ? Math.round(
                filteredFlights.reduce(
                    (sum, flight) =>
                        sum +
                        Number(
                            flight.startingPrice
                        ),
                    0
                ) / filteredFlights.length
            )
            : 0;

    /**
     * Check whether a date has available flights.
     */
    function hasFlights(date: Date): boolean {
        return availableDates.has(formatDate(date));
    }

    /**
     * Check whether date is selected.
     */
    function isSelected(date: Date): boolean {
        return (
            formatDate(date) ===
            formatDate(selectedDate)
        );
    }

    /**
     * Display:
     * Mon, Tue, Wed...
     */
    function getDayName(date: Date): string {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
        });
    }

    /**
     * Display:
     * Aug 12
     */
    function getDateLabel(date: Date): string {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    return (
        <PageContainer>
            <div className="space-y-8">
                {/* Page Header */}
                <PageTitle
                    title="Available Flights"
                    subtitle="Browse flights currently available for booking."
                />

                {/* Weekly Date Selector */}
                <div className="bg-white border rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-2">
                        {/* Previous week */}
                        <button
                            type="button"
                            onClick={() =>
                                changeWeek(-1)
                            }
                            className="flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Previous week"
                        >
                            ←
                        </button>

                        {/* Days */}
                        <div className="grid grid-cols-7 flex-1 gap-2">
                            {weekDays.map((date) => {
                                const selected =
                                    isSelected(date);

                                const hasAvailableFlights =
                                    hasFlights(date);

                                return (
                                    <button
                                        key={formatDate(
                                            date
                                        )}
                                        type="button"
                                        onClick={() =>
                                            handleDateSelect(
                                                date
                                            )
                                        }
                                        className={`
                                            relative
                                            py-3
                                            rounded-xl
                                            text-center
                                            transition
                                            ${
                                            selected
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "hover:bg-gray-100 text-gray-700"
                                        }
                                        `}
                                    >
                                        {getDayName(date)}

                                        <div className="text-sm font-semibold mt-1">
                                            {getDateLabel(
                                                date
                                            )}
                                        </div>

                                        {hasAvailableFlights && (
                                            <span
                                                className={`
                                                    absolute
                                                    bottom-1
                                                    left-1/2
                                                    -translate-x-1/2
                                                    w-1.5
                                                    h-1.5
                                                    rounded-full
                                                    ${
                                                    selected
                                                        ? "bg-white"
                                                        : "bg-blue-600"
                                                }
                                                `}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next week */}
                        <button
                            type="button"
                            onClick={() =>
                                changeWeek(1)
                            }
                            className="flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Next week"
                        >
                            →
                        </button>
                    </div>

                    {/* Full calendar button */}
                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={() =>
                                setCalendarOpen(true)
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Choose another date
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Available Flights"
                        value={filteredFlights.length}
                        color="text-blue-600"
                    />

                    <StatCard
                        label="Average Price"
                        value={`$${averagePrice}`}
                        color="text-green-600"
                    />

                    <StatCard
                        label="Booking Status"
                        value="Open"
                        color="text-indigo-600"
                    />
                </div>

                {/* Search */}
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by flight number or destination..."
                />

                {/* Flights */}
                <div className="bg-white border rounded-2xl shadow-sm p-8">
                    {loading && <CardSkeletonGrid />}

                    {!loading &&
                        filteredFlights.length === 0 && (
                            <EmptyState
                                title="No Available Flights"
                                message={`There are no available flights on ${getDateLabel(
                                    selectedDate
                                )}.`}
                            />
                        )}

                    {!loading &&
                        filteredFlights.length > 0 && (
                            <FlightGrid
                                flights={filteredFlights}
                            />
                        )}
                </div>
            </div>

            {/* Full Calendar Modal */}
            {calendarOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() =>
                        setCalendarOpen(false)
                    }
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Select Departure Date
                            </h2>

                            <button
                                type="button"
                                onClick={() =>
                                    setCalendarOpen(false)
                                }
                                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500"
                                aria-label="Close calendar"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={
                                    selectedDate
                                }
                                onSelect={
                                    handleDateSelect
                                }
                                showOutsideDays
                                navLayout="around"
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setCalendarOpen(false)
                                }
                                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

export default AvailableFlightsPage;