import type { Flight } from "../../types/Flight";
import FlightCard from "./FlightCard";

interface FlightGridProps {
    flights: Flight[];
    onSelectFlight?: (flight: Flight) => void;
}

const FlightGrid = ({
    flights,
    onSelectFlight,
}: FlightGridProps) => {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {flights.map((flight) => (
                <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={
                        onSelectFlight
                            ? () => onSelectFlight(flight)
                            : undefined
                    }
                />
            ))}
        </div>
    );
};

export default FlightGrid;