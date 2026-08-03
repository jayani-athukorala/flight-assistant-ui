import { useState } from "react";
import type { Flight } from "../../types/Flight";

import Card from "../common/Card";
import Button from "../common/Button";

import BookingModal from "./BookingModal";


interface FlightCardProps {
    flight: Flight;
}


export default function FlightCard({
                                       flight
                                   }: FlightCardProps) {


    const [showModal, setShowModal] = useState(false);


    return (

        <>

            <Card>

                <div className="space-y-3">

                    <h3 className="text-xl font-bold">
                        {flight.flightNumber}
                    </h3>


                    <p>
                        Destination:
                        {" "}
                        {flight.destination}
                    </p>


                    <p>
                        Departure:
                        {" "}
                        {flight.departureTime}
                    </p>


                    <p>
                        Arrival:
                        {" "}
                        {flight.arrivalTime}
                    </p>


                    <p>
                        Price:
                        {" "}
                        ${flight.price}
                    </p>


                    <p>
                        Status:
                        {" "}
                        {flight.status}
                    </p>


                    <Button
                        onClick={() => setShowModal(true)}
                    >

                        Book Flight

                    </Button>


                </div>


            </Card>



            {
                showModal && (

                    <BookingModal

                        flight={flight}

                        onClose={() =>
                            setShowModal(false)
                        }

                    />

                )
            }


        </>

    );

}