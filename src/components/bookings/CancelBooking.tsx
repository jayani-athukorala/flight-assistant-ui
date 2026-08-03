import { useState } from "react";

import Button from "../common/Button";
import Alert from "../common/Alert";

import { cancelBooking } from "../../api/flightService";


interface CancelBookingProps {

    flightId:number;

    email:string;

    onCancelled?:()=>void;

}



export default function CancelBooking({

                                                flightId,

                                                email,

                                                onCancelled

                                            }:CancelBookingProps){


    const [loading,setLoading] = useState(false);

    const [message,setMessage] = useState("");

    const [error,setError] = useState("");



    const handleCancel = async()=>{


        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this booking?"
        );


        if(!confirmCancel){

            return;

        }



        try{


            setLoading(true);

            setError("");



            await cancelBooking(
                flightId,
                email
            );



            setMessage(
                "Booking cancelled successfully"
            );



            if(onCancelled){

                onCancelled();

            }



        }
        catch(error){

            setError(
                "Unable to cancel booking"
            );

        }
        finally{

            setLoading(false);

        }

    };



    return (

        <div className="mt-4">


            {
                message &&

                <Alert

                    type="success"

                    message={message}

                />

            }



            {
                error &&

                <Alert

                    type="error"

                    message={error}

                />

            }



            <Button

                onClick={handleCancel}

                disabled={loading}

            >

                {
                    loading
                        ?
                        "Cancelling..."
                        :
                        "Cancel Booking"
                }


            </Button>


        </div>

    );

}