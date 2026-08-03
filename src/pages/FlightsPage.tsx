import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import { getFlights } from "../api/flightService";
import FlightCard from "../components/flights/FlightCard";

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


                    <div className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-6
">

                        {
                            flights.map((flight)=>(

                                <FlightCard
                                    key={flight.id}
                                    flight={flight}
                                />

                            ))
                        }

                    </div>


                </div>


            </div>


        </PageContainer>
    );
};


export default FlightsPage;