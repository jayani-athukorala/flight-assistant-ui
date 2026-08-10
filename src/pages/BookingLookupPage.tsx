import { useEffect, useState } from "react";

import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";
import BookingCard from "../components/bookings/BookingCard";

import { getBookings } from "../api/flightService";
import type { Booking } from "../types/Booking";

const BookingLookupPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadBookings = async () => {
            try {
                const data = await getBookings();

                if (!cancelled) {
                    setBookings(data);
                    setError("");
                }
            } catch (error) {
                console.error("Failed to load bookings:", error);

                if (!cancelled) {
                    setError("Unable to load your bookings.");
                    setBookings([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadBookings();

        return () => {
            cancelled = true;
        };
    }, []);

    const refreshBookings = async () => {
        try {
            setError("");

            const data = await getBookings();

            setBookings(data);
        } catch (error) {
            console.error("Failed to refresh bookings:", error);
            setError("Unable to refresh your bookings.");
        }
    };

    return (
        <PageContainer>
            <PageTitle
                title="My Bookings"
                subtitle="View and manage your flight bookings."
            />

            <div className="rounded-xl bg-white p-8 shadow">

                {loading && (
                    <div className="py-10 text-center text-slate-600">
                        Loading your bookings...
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="rounded-xl bg-slate-50 p-8 text-center">
                        <p className="font-medium text-slate-700">
                            You don't have any bookings yet.
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            Browse available flights to make your first booking.
                        </p>
                    </div>
                )}

                {!loading && bookings.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                refresh={refreshBookings}
                            />
                        ))}
                    </div>
                )}

            </div>
        </PageContainer>
    );
};

export default BookingLookupPage;