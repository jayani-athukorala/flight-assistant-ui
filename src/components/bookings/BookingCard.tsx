import Card from "../common/Card";
import CancelBookingButton from "./CancelBooking";

import {Plane, User, Mail, Ticket} from "lucide-react";

interface BookingCardProps {

    booking:{
        id:number;
        flightId:number;
        flightNumber:string;
        passengerName:string;
        passengerEmail:string;
    };

    refresh:()=>void;

}

const BookingCard = ({booking, refresh}:BookingCardProps) => {
    return (
        <Card>
            <div className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Plane size={24}/>
                        </div>


                        <div>
                            <p className="text-sm text-slate-500 ">Flight Number</p>
                            <h2 className="text-xl font-bold text-slate-800">{booking.flightNumber}</h2>
                        </div>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">Confirmed</span>
                </div>

                {/* Passenger Information */}
                <div className="space-y-3 rounded-xl bg-slate-50 p-4 mb-5">
                    <div className="flex items-center gap-3">
                        <User size={18} className="text-slate-500"/>
                        <div>
                            <p className="text-xs text-slate-500 ">Passenger</p>
                            <p className="font-medium text-slate-800">{booking.passengerName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        <Mail size={18} className="text-slate-500"/>
                        <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-medium text-slate-800">{booking.passengerEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 ">
                        <Ticket size={16}/>Booking ID:
                        <span className="font-semibold text-slate-700">{booking.id}</span>
                    </div>

                    <CancelBookingButton flightId={booking.flightId} email={booking.passengerEmail} onCancelled={refresh}/>

                </div>
            </div>
        </Card>
    );
};

export default BookingCard;