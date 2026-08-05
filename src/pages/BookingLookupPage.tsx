import { useState } from "react";

import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import BookingCard from "../components/bookings/BookingCard";

import { getBookings } from "../api/flightService";
import type { Booking } from "../types/Booking";

const BookingLookupPage = () => {

    const [email, setEmail] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const searchBookings = async () => {

        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const data = await getBookings(email);
            setBookings(data);

        } catch (error) {
            console.error(error);
            setError("Unable to load bookings");
            setBookings([]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageTitle title="My Bookings" subtitle="Search and manage your flight bookings." />
            <div className="rounded-xl bg-white p-8 shadow">

                {/* Search Section */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row">

                    <input type="email" placeholder="Enter your email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-200 "/>
                    <button onClick={searchBookings} className=" rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700">
                        Search
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-6 text-center text-slate-600">Loading bookings...</div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-600 ">{error}</div>
                )}

                {/* Empty State */}
                {!loading && bookings.length === 0 && !error && (
                    <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500">
                        No bookings found.
                    </div>
                )}

                {/* Booking Cards */}
                {!loading && bookings.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {bookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} refresh={searchBookings}/>
                        ))}
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default BookingLookupPage;