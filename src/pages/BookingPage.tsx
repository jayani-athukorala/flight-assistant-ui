import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BookingForm from "../components/bookings/BookingForm";
import type { Flight } from "../types/Flight";
import { getFlightById } from "../api/flightService";

export default function BookingPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [flight, setFlight] = useState<Flight | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchFlight = async () => {

            try {
                if (!id) {
                    setError("Flight ID missing");
                    return;
                }
                const data = await getFlightById(
                    Number(id)
                );
                setFlight(data);
            } catch {
                setError(
                    "Unable to load flight details"
                );

            } finally {
                setLoading(false);
            }
        };
        fetchFlight();
    }, [id]);

    if (loading) {
        return (
            <div className="text-center mt-10">
                Loading flight details...
            </div>
        );

    }

    if (error) {
        return (
            <div className="text-center mt-10 text-red-600">
                {error}
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="text-center mt-10">
                Flight not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <BookingForm flight={flight} onClose={() => navigate(-1)} />

        </div>
    );
}