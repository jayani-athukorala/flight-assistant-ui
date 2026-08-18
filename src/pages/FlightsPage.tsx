import { useEffect, useMemo, useState } from "react";

import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import SearchInput from "../components/common/SearchInput";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/flights/EmptyState";
import CardSkeletonGrid from "../components/common/CardSkeletonGrid";

import FlightGrid from "../components/flights/FlightGrid";

import { getFlights } from "../api/flightService";
import type { Flight } from "../types/Flight";

const FlightsPage = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const data = await getFlights();

                console.log("FLIGHTS RESPONSE:", data);
                console.log(
                    "TOKEN:",
                    localStorage.getItem("token")
                );

                setFlights(data);
            } catch (error) {
                console.error(
                    "Failed to load flights",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchFlights();
    }, []);

    /**
     * Check whether a flight has already departed.
     */
    const hasDeparted = (flight: Flight): boolean => {
        return (
            new Date(flight.departureTime).getTime() <=
            Date.now()
        );
    };

    /**
     * Filter flights based on search.
     */
    const filteredFlights = useMemo(() => {
        const term = search.toLowerCase();

        return flights.filter(
            (flight) =>
                flight.flightNumber
                    .toLowerCase()
                    .includes(term) ||
                flight.destination
                    .toLowerCase()
                    .includes(term)
        );
    }, [flights, search]);

    /**
     * A flight is available only when:
     *
     * 1. Its status is AVAILABLE
     * 2. Its departure time has not passed
     */
    const availableFlights = flights.filter((flight) => {
        const status = (
            flight.status ?? "AVAILABLE"
        ).toLowerCase();

        return (
            status === "available" &&
            !hasDeparted(flight)
        );
    }).length;

    /**
     * Everything else is unavailable.
     */
    const unavailableFlights =
        flights.length - availableFlights;

    return (
        <PageContainer>
            <div className="space-y-8">
                <PageTitle
                    title="All Flights"
                    subtitle="Browse and manage all flights in the system."
                />

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Total Flights"
                        value={flights.length}
                    />

                    <StatCard
                        label="Available"
                        value={availableFlights}
                        color="text-green-600"
                    />

                    <StatCard
                        label="Unavailable"
                        value={unavailableFlights}
                        color="text-red-500"
                    />
                </div>

                {/* Search */}
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by flight number or destination..."
                />

                {/* Flight List */}
                <div className="bg-white border rounded-2xl shadow-sm p-8">
                    {loading && (
                        <CardSkeletonGrid />
                    )}

                    {!loading &&
                        filteredFlights.length === 0 && (
                            <EmptyState
                                title="No Flights Found"
                                message="Try searching for another destination or flight number."
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
        </PageContainer>
    );
};

export default FlightsPage;