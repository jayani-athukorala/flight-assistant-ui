import { useState } from "react";
import type { FormEvent } from "react";

import { X } from "lucide-react";

import type { Flight } from "../../types/Flight";

import Input from "../common/Input";
import Button from "../common/Button";
import Alert from "../common/Alert";

import { bookFlight } from "../../api/flightService";


interface BookingModalProps {

    flight: Flight;

    onClose: () => void;

}



export default function BookingModal({
                                         flight,
                                         onClose
                                     }: BookingModalProps) {


    const [name,setName] = useState("");

    const [email,setEmail] = useState("");

    const [success,setSuccess] = useState("");

    const [error,setError] = useState("");

    const [loading,setLoading] = useState(false);



    const handleSubmit = async (
        e: FormEvent
    ) => {

        e.preventDefault();


        if(!name || !email){

            setError(
                "Name and email are required"
            );

            return;
        }


        try {

            setLoading(true);

            setError("");



            await bookFlight(
                flight.id,
                name,
                email
            );


            setSuccess(
                "Booking successful!"
            );


        }
        catch(error){

            setError(
                "Booking failed"
            );

        }
        finally{

            setLoading(false);

        }

    };



    return (

        <div className="
            fixed
            inset-0
            bg-black/50
            flex
            justify-center
            items-center
            z-50
        ">


            <div className="
                bg-white
                rounded-xl
                p-6
                w-full
                max-w-md
            ">


                <div className="
                    flex
                    justify-between
                    mb-5
                ">


                    <h2 className="text-xl font-bold">

                        Book Flight

                    </h2>


                    <button
                        onClick={onClose}
                    >

                        <X/>

                    </button>


                </div>



                {
                    success &&

                    <Alert
                        type="success"
                        message={success}
                    />

                }


                {
                    error &&

                    <Alert
                        type="error"
                        message={error}
                    />

                }



                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 mt-4"
                >


                    <Input

                        label="Passenger Name"

                        value={name}

                        onChange={
                            e=>setName(e.target.value)
                        }

                        placeholder="John Smith"

                    />



                    <Input

                        label="Passenger Email"

                        type="email"

                        value={email}

                        onChange={
                            e=>setEmail(e.target.value)
                        }

                        placeholder="john@email.com"

                    />



                    <Button

                        type="submit"

                        disabled={loading}

                        fullWidth

                    >

                        {
                            loading
                                ?
                                "Booking..."
                                :
                                "Confirm Booking"
                        }


                    </Button>


                </form>


            </div>


        </div>

    );

}