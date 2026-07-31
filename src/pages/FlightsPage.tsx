import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import { getFlights } from "../api/flightService";

interface Flight {
    id: number;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    status: string;
    destination: string;
    price: number;
}

const FlightsPage = () => {

    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchFlights = async () => {
            try {

                const data = await getFlights();

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


        fetchFlights();

    }, []);



    return (
        <PageContainer>

            <PageTitle
                title="All Flights"
                subtitle="Browse all flights from our system."
            />


            <div className="bg-white rounded-xl shadow p-8">


                {loading && (
                    <p>Loading flights...</p>
                )}



                {!loading && flights.length === 0 && (
                    <p>
                        No flights found.
                    </p>
                )}



                <div className="grid gap-4">


                    {flights.map((flight)=>(

                        <div
                            key={flight.id}
                            className="border rounded-lg p-5"
                        >

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

                        </div>

                    ))}


                </div>


            </div>


        </PageContainer>
    );
};


export default FlightsPage;