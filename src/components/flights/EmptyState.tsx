import { Plane } from "lucide-react";


interface EmptyStateProps {

    message?: string;

}



export default function EmptyState({

                                       message="No flights found."

                                   }:EmptyStateProps){


    return (

        <div className="
            flex
            flex-col
            items-center
            justify-center
            py-16
            text-center
        ">


            <Plane

                size={50}

                className="text-slate-400"

            />


            <h2 className="
                text-xl
                font-semibold
                mt-4
            ">

                {message}

            </h2>


            <p className="
                text-slate-500
                mt-2
            ">

                Please try again later.

            </p>


        </div>

    );

}