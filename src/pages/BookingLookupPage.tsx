import { useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import { getBookings } from "../api/flightService";


interface Booking {
    id: number;
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



    const searchBookings = async () => {

        try {

            setError("");

            const data = await getBookings(email);

            setBookings(data);


        } catch (err) {

            console.error(err);

            setError(
                "Unable to load bookings"
            );

        }

    };



    return (
        <PageContainer>


            <PageTitle
                title="My Bookings"
                subtitle="Search your bookings using your email."
            />



            <div className="bg-white rounded-xl shadow p-8">


                <div className="flex gap-4 mb-6">


                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e)=>
                            setEmail(e.target.value)
                        }
                        className="border rounded-lg px-4 py-2 flex-1"
                    />


                    <button
                        onClick={searchBookings}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        Search
                    </button>


                </div>



                {error && (
                    <p className="text-red-500">
                        {error}
                    </p>
                )}



                {bookings.length === 0 && !error && (

                    <p className="text-slate-600">
                        No bookings found.
                    </p>

                )}




                <div className="space-y-4">


                    {bookings.map((booking)=>(

                        <div
                            key={booking.id}
                            className="border rounded-lg p-5"
                        >


                            <h3 className="font-bold text-lg">
                                Flight: {booking.flightNumber}
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
                                Status:
                                {" "}
                                {booking.status}
                            </p>


                        </div>

                    ))}


                </div>



            </div>


        </PageContainer>
    );
};


export default BookingLookupPage;