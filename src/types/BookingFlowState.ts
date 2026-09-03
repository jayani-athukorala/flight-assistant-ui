import type { Flight, SeatClass } from "./Flight";
import type { PassengerRequest, TripType } from "./Booking";

export type BookingStep =
    | "TRIP"
    | "PASSENGERS"
    | "SEATS"
    | "REVIEW";

export interface BookingFlowState {
    outboundFlight: Flight;
    returnFlight: Flight | null;
    tripType: TripType;

    /** UI filter only. It is not sent in BookingRequest. */
    seatClass: SeatClass;

    passengers: PassengerRequest[];
    step: BookingStep;
}