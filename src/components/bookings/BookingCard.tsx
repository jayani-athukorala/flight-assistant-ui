import Card from "../common/Card";

import CancelBookingButton from "./CancelBooking";


interface BookingCardProps {


    booking:{

        flightId:number;

        flightNumber:string;

        passengerName:string;

        passengerEmail:string;

    };


    refresh:()=>void;

}



export default function BookingCard({

                                        booking,

                                        refresh

                                    }:BookingCardProps){


    return (

        <Card>


            <h2 className="text-xl font-bold">

                {booking.flightNumber}

            </h2>



            <p>

                Passenger:

                {" "}

                {booking.passengerName}

            </p>



            <p>

                Email:

                {" "}

                {booking.passengerEmail}

            </p>



            <CancelBookingButton

                flightId={booking.flightId}

                email={booking.passengerEmail}

                onCancelled={refresh}

            />


        </Card>

    );

}