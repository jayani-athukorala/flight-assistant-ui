import type { Flight } from "../../types/Flight";
import FlightCard from "./FlightCard";

interface FlightGridProps {
    flights: Flight[];
    onSelectFlight: (flight: Flight) => void;
}

const FlightGrid = ({
                        flights,
                        onSelectFlight,
                    }: FlightGridProps) => {
    return (
        <div
            className="
                grid
                grid-cols-1
                items-stretch
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
            "
        >
            {flights.map((flight) => (
                <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={() =>
                        onSelectFlight(flight)
                    }
                />
            ))}
        </div>
    );
};

export default FlightGrid;