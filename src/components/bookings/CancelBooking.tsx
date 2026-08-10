import { useState } from "react";
import Button from "../common/Button";
import Alert from "../common/Alert";

import { cancelBooking } from "../../api/flightService";
import axios from "axios";

interface CancelBookingProps {
    bookingId:number;
    email:string;
    onCancelled?:()=>void;
}

const CancelBooking = ({bookingId, onCancelled}:CancelBookingProps) => {
    const [loading,setLoading] = useState(false);
    const [message,setMessage] = useState("");
    const [error,setError] = useState("");

    const handleCancel = async()=>{
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if(!confirmed){
            return;
        }

        try{
            setLoading(true);
            setMessage("");
            setError("");

            await cancelBooking(bookingId);
            setMessage("Booking cancelled successfully");

            if(onCancelled){
                onCancelled();
            }
        }
        catch (error) {

            console.error("CANCEL BOOKING ERROR:", error);

            if (axios.isAxiosError(error)) {
                console.error(
                    "Status:",
                    error.response?.status
                );

                console.error(
                    "Response:",
                    error.response?.data
                );
            }

            setError("Unable to cancel booking");
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 space-y-3">
            { message && <Alert type="success" message={message}/> }
            { error && <Alert type="error" message={error} /> }

            <Button variant="danger" onClick={handleCancel} disabled={loading}>
                { loading?"Cancelling...":"Cancel Booking" }
            </Button>
        </div>
    );
};

export default CancelBooking;
