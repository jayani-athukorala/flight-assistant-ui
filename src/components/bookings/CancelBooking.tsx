import { useState } from "react";
import Button from "../common/Button";
import Alert from "../common/Alert";

import { cancelBooking } from "../../api/flightService";

interface CancelBookingProps {
    flightId:number;
    email:string;
    onCancelled?:()=>void;
}

const CancelBooking = ({flightId, email, onCancelled}:CancelBookingProps) => {
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

            await cancelBooking(flightId, email);
            setMessage("Booking cancelled successfully");

            if(onCancelled){
                onCancelled();
            }
        }
        catch(error){
            console.error(error);
            setError("Unable to cancel booking");
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 space-y-3">
            {
                message &&
                <Alert type="success" message={message}/>
            }
            {
                error &&
                <Alert type="error" message={error} />
            }

            <Button variant="danger" onClick={handleCancel} disabled={loading}>
                {
                    loading?"Cancelling...":"Cancel Booking"
                }
            </Button>
        </div>
    );
};

export default CancelBooking;
