import { useState } from "react";
import type { FormEvent } from "react";

import type { Flight } from "../../types/Flight";
import { bookFlight } from "../../api/flightService";

import Button from "../common/Button";
import Input from "../common/Input";
import Alert from "../common/Alert";
import axios from "axios";

interface BookingFormProps {
    flight: Flight;
    onClose: () => void;
}

type SeatClass = "ECONOMY" | "BUSINESS";

const BookingForm = ({ flight, onClose }: BookingFormProps) => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [passportNumber, setPassportNumber] = useState("");
    const [email, setEmail] = useState("");

    const [seatClass, setSeatClass] = useState<SeatClass>("ECONOMY");

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    const handleSubmit = async (
        e: FormEvent
    ) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            await bookFlight(flight.id, {
                outboundFlightId: flight.id,
                returnFlightId: null,
                tripType: "ONE_WAY",
                seatClass,
                passengers: [
                    {
                        firstName,
                        lastName,
                        passportNumber,
                        email
                    }
                ]
            });

            setSuccess("Booking created successfully!");
        }
        catch (error) {

            if (axios.isAxiosError(error)) {
                console.error("STATUS:", error.response?.status);
                console.error("BACKEND RESPONSE:", error.response?.data);
            } else {
                console.error("ERROR:", error);
            }
            setError("Unable to create booking");
        }
        finally {
            setLoading(false);

        }
    };


    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        Complete your booking
                    </h1>

                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
                        ✕
                    </button>
                </div>


                {/* Flight summary */}
                <div className="bg-blue-50 rounded-xl p-5 mb-8">
                    <h2 className="font-semibold text-lg">
                        {flight.flightNumber}
                    </h2>

                    <p className="mt-2">
                        {flight.origin}
                        {" → "}
                        {flight.destination}
                    </p>

                    <p>
                        Departure: {" "}
                        {new Date(flight.departureTime).toLocaleString()}
                    </p>
                </div>



                <form onSubmit={handleSubmit} className="space-y-5">

                    <h2 className="text-xl font-semibold">
                        Passenger Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="First name" value={firstName} onChange={ e => setFirstName(e.target.value)}/>
                        <Input label="Last name" value={lastName} onChange={ e => setLastName(e.target.value)}/>

                    </div>
                    <Input label="Passport number" value={passportNumber} onChange={ e => setPassportNumber(e.target.value) } />
                    <Input label="Email" type="email" value={email} onChange={ e => setEmail(e.target.value) } />

                    <div>
                        <label className="block text-sm mb-2">
                            Seat Class
                        </label>

                        <select value={seatClass} onChange={e =>
                                    setSeatClass( e.target.value as SeatClass ) } className="border rounded-lg p-3 w-full">

                            <option value="ECONOMY">
                                Economy
                            </option>

                            <option value="BUSINESS">
                                Business
                            </option>
                        </select>
                    </div>
                    { success && <Alert type="success" message={success} />}
                    { error && <Alert type="error" message={error} /> }

                    <div className="flex gap-4">
                        <Button type="button" onClick={onClose} fullWidth>
                            Cancel
                        </Button>

                        <Button type="submit" disabled={loading} fullWidth>
                            { loading ? "Booking..." : "Confirm Booking" }
                        </Button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;