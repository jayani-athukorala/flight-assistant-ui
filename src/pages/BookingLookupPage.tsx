import { useState } from "react";

import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";

import {
    getBookings,
    cancelBooking
} from "../api/flightService";


interface Booking {

    id: number;

    flightId: number;

    flightNumber: string;

    passengerName: string;

    passengerEmail: string;

    destination: string;

    departureTime: string;

    status: string;

}



const BookingLookupPage = () => {


    const [email, setEmail] = useState("");

    const [bookings, setBookings] = useState<Booking[]>([]);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const [cancelLoading, setCancelLoading] = useState<number | null>(null);



    const searchBookings = async () => {


        if(!email){

            setError(
                "Please enter your email"
            );

            return;

        }


        try {


            setLoading(true);

            setError("");

            setMessage("");



            const data = await getBookings(email);


            setBookings(data);



        } catch(error){


            console.error(error);


            setError(
                "Unable to load bookings"
            );


        }
        finally{


            setLoading(false);


        }


    };





    const handleCancel = async (

        flightId:number,

        passengerEmail:string

    ) => {



        const confirmCancel = window.confirm(

            "Are you sure you want to cancel this booking?"

        );



        if(!confirmCancel){

            return;

        }



        try {


            setCancelLoading(flightId);

            setError("");

            setMessage("");



            await cancelBooking(

                flightId,

                passengerEmail

            );



            setMessage(

                "Booking cancelled successfully"

            );



            // reload bookings after cancellation

            await searchBookings();



        }
        catch(error){


            console.error(error);


            setError(

                "Unable to cancel booking"

            );


        }
        finally{


            setCancelLoading(null);


        }


    };





    return (

        <PageContainer>


            <PageTitle

                title="My Bookings"

                subtitle="Search and manage your flight bookings."

            />



            <div className="
                bg-white
                rounded-xl
                shadow
                p-8
            ">


                {/* Search Area */}

                <div className="
                    flex
                    gap-4
                    mb-6
                ">


                    <input

                        type="email"

                        placeholder="Enter your email"

                        value={email}

                        onChange={(e)=>
                            setEmail(e.target.value)
                        }

                        className="
                            border
                            rounded-lg
                            px-4
                            py-2
                            flex-1
                        "

                    />



                    <button

                        onClick={searchBookings}

                        className="
                            bg-blue-600
                            text-white
                            px-6
                            py-2
                            rounded-lg
                            hover:bg-blue-700
                        "

                    >

                        Search

                    </button>


                </div>





                {
                    loading && (

                        <p className="text-slate-600">

                            Loading bookings...

                        </p>

                    )
                }






                {
                    error && (

                        <p className="
                            text-red-600
                            mb-4
                        ">

                            {error}

                        </p>

                    )
                }





                {
                    message && (

                        <p className="
                            text-green-600
                            mb-4
                        ">

                            {message}

                        </p>

                    )
                }





                {
                    !loading &&
                    bookings.length === 0 && (

                        <p className="text-slate-600">

                            No bookings found.

                        </p>

                    )
                }







                <div className="space-y-5">



                    {
                        bookings.map((booking)=>(


                            <div

                                key={booking.id}

                                className="
                                    border
                                    rounded-lg
                                    p-5
                                "

                            >



                                <h3 className="
                                    text-xl
                                    font-bold
                                ">

                                    Flight:
                                    {" "}
                                    {booking.flightNumber}

                                </h3>





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





                                <p>

                                    Destination:
                                    {" "}
                                    {booking.destination}

                                </p>





                                <p>

                                    Departure:
                                    {" "}
                                    {booking.departureTime}

                                </p>





                                <p>

                                    Status:
                                    {" "}
                                    {booking.status}

                                </p>






                                <button


                                    onClick={()=>

                                        handleCancel(

                                            booking.flightId,

                                            booking.passengerEmail

                                        )

                                    }



                                    disabled={

                                        cancelLoading === booking.flightId

                                    }



                                    className="
                                        mt-4
                                        bg-red-600
                                        text-white
                                        px-5
                                        py-2
                                        rounded-lg
                                        hover:bg-red-700
                                        disabled:bg-gray-400
                                    "


                                >

                                    {

                                        cancelLoading === booking.flightId

                                            ?

                                            "Cancelling..."

                                            :

                                            "Cancel Booking"

                                    }


                                </button>





                            </div>


                        ))

                    }



                </div>




            </div>



        </PageContainer>

    );

};



export default BookingLookupPage;