import type { BookingResponse, PassengerRequest, TripType } from "../../types/Booking";
import type { Flight, FlightSeat, SeatClass } from "../../types/Flight";

export type BookingPhase =
    | "COUNT"
    | "DETAILS"
    | "OUTBOUND_SEATS"
    | "RETURN_CHOICE"
    | "RETURN_DATE"
    | "RETURN_FLIGHTS"
    | "RETURN_SEATS"
    | "REVIEW"
    | "COMPLETE";

export interface AssistantBookingFlow {
    phase: BookingPhase;
    outboundFlight: Flight;
    returnFlight: Flight | null;
    tripType: TripType;
    seatClass: SeatClass;
    returnSeatClass: SeatClass;
    passengerCount: number;
    passengers: PassengerRequest[];
    returnDate: string;
    returnFlights: Flight[];
    outboundSeats: FlightSeat[];
    returnSeats: FlightSeat[];
    booking: BookingResponse | null;
    loading: boolean;
    error: string | null;
}

export const createPassenger = (): PassengerRequest => ({
    firstName: "",
    lastName: "",
    passportNumber: "",
    email: "",
    outboundSeatId: 0,
    returnSeatId: null,
});

export const createBookingFlow = (flight: Flight): AssistantBookingFlow => ({
    phase: "COUNT",
    outboundFlight: flight,
    returnFlight: null,
    tripType: "ONE_WAY",
    seatClass: "ECONOMY",
    returnSeatClass: "ECONOMY",
    passengerCount: 1,
    passengers: [createPassenger()],
    returnDate: flight.departureTime.split("T")[0],
    returnFlights: [],
    outboundSeats: [],
    returnSeats: [],
    booking: null,
    loading: false,
    error: null,
});
