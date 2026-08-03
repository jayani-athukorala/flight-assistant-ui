import type { Flight } from "../../types/Flight";

import FlightCard from "./FlightCard";


interface FlightGridProps {

    flights: Flight[];

}


export default function FlightGrid({
                                       flights
                                   }: FlightGridProps) {


    return (

        <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
        ">

            {
                flights.map((flight) => (

                    <FlightCard

                        key={flight.id}

                        flight={flight}

                    />

                ))
            }


        </div>

    );
}