import type { Flight } from "../../types/Flight";
import FlightCard from "./FlightCard";

interface FlightGridProps {
    flights: Flight[];
}

export default function FlightGrid({flights}: FlightGridProps) {

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {flights.map((flight)=>(
                <FlightCard key={flight.id} flight={flight}/>
            ))}
        </div>
    );
}