import { useEffect, useMemo, useState } from "react";

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

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const data = await getAvailableFlights();
                setFlights(data);
            } catch(error) {
                console.error("Failed to load available flights", error);
            } finally {
                setLoading(false);
            }
        };
        void fetchFlights();
    }, []);

    const filteredFlights = useMemo(() => {

        const term = search.toLowerCase();
        return flights.filter((flight) => (
            flight.flightNumber.toLowerCase().includes(term) || flight.destination.toLowerCase().includes(term)
        ));
    }, [flights, search]);

    const averagePrice = flights.length > 0 ? Math.round(
                flights.reduce((sum, flight) => sum + flight.price, 0)/flights.length):0;

    return (

        <PageContainer>
            <div className="space-y-8">
                <PageTitle title="Available Flights" subtitle="Browse flights currently available for booking."/>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                    <StatCard label="Available Flights" value={flights.length} color="text-blue-600"/>
                    <StatCard label="Average Price" value={`$${averagePrice}`} color="text-green-600" />
                    <StatCard label="Booking Status" value="Open" color="text-indigo-600"/>
                </div>

                {/* Search */}
                <SearchInput value={search} onChange={setSearch} placeholder="Search by flight number or destination..."/>

                {/* Flights */}
                <div className="bg-white border rounded-2xl shadow-sm p-8">
                    {loading && (
                        <CardSkeletonGrid/>
                    )}
                    {!loading &&
                        filteredFlights.length === 0 && (
                            <EmptyState title="No Available Flights" message="There are currently no flights available for booking."/>
                        )}
                    {!loading &&
                        filteredFlights.length > 0 && (
                            <FlightGrid flights={filteredFlights}/>
                        )}
                </div>
            </div>
        </PageContainer>
    );
};

export default AvailableFlightsPage;