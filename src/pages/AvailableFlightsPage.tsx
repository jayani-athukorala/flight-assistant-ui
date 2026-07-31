import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import { getAvailableFlights } from "../api/flightService";


interface Flight {
    id:number;
    flightNumber:string;
    destination:string;
    price:number;
    status:string;
}


const AvailableFlightsPage = () => {

    const [flights,setFlights] = useState<Flight[]>([]);


    useEffect(()=>{

        getAvailableFlights()
            .then(data=>{
                setFlights(data);
            })
            .catch(error=>{
                console.error(error);
            });

    },[]);



    return (

        <PageContainer>

            <PageTitle
                title="Available Flights"
                subtitle="Flights currently open for booking."
            />


            <div className="bg-white rounded-xl shadow p-8">


                {flights.map((flight)=>(

                    <div
                        key={flight.id}
                        className="border rounded-lg p-5 mb-4"
                    >

                        <h3 className="font-bold text-lg">
                            {flight.flightNumber}
                        </h3>

                        <p>
                            Destination:
                            {flight.destination}
                        </p>

                        <p>
                            Price:
                            ${flight.price}
                        </p>

                        <p>
                            Status:
                            {flight.status}
                        </p>

                    </div>

                ))}


            </div>


        </PageContainer>

    );
};


export default AvailableFlightsPage;