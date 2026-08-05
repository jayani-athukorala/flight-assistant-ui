import { Link } from "react-router-dom";
import { Plane, Search, Ticket } from "lucide-react";

import PageContainer from "../components/layout/PageContainer";

const Home = () => {
    return (

        <PageContainer>
            <section className="text-center py-20">
                <Plane size={70} className="mx-auto text-blue-600"/>
                <h1 className="text-5xl font-bold mt-8">SkuRoute Airways - Flight Reservation System</h1>
                <p className="mt-6 text-slate-600 text-lg max-w-2xl mx-auto">
                    Search flights, reserve your seat,
                    manage bookings and travel with confidence.
                </p>

                <Link to="/flights" className="inline-block mt-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition">
                    Browse Flights
                </Link>
            </section>

            <section className="grid md:grid-cols-3 gap-8 mt-10 ">

                {/* Find Flights */}
                <Link to="/flights" className="block group">
                    <div className="bg-white p-8 rounded-xl shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <Search className="text-blue-600" size={36}/>
                        <h2 className="font-semibold text-xl mt-4">Find Flights</h2>
                        <p className="mt-2 text-slate-500">Browse all available flights.</p>
                    </div>
                </Link>

                {/* Available Flights / Booking */}
                <Link to="/available" className="block">
                    <div className="bg-white p-8 rounded-xl shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <Ticket className="text-blue-600" size={36}/>
                        <h2 className="font-semibold text-xl mt-4 ">Book Online</h2>
                        <p className="mt-2 text-slate-500">Reserve your seat instantly.</p>
                    </div>
                </Link>

                {/* Manage Bookings */}
                <Link to="/bookings" className="block">
                    <div className="bg-white p-8 rounded-xl shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <Plane className="text-blue-600" size={36}/>
                        <h2 className="font-semibold text-xl mt-4 ">Manage Bookings</h2>
                        <p className="mt-2 text-slate-500">View and cancel bookings anytime.</p>
                    </div>
                </Link>
            </section>
        </PageContainer>
    );
};

export default Home;