import type { Flight } from "./Flight";

export type TripType = "ONE_WAY" | "ROUND_TRIP";

export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED";

export interface PassengerRequest {
    firstName: string;
    lastName: string;
    passportNumber: string;
    email: string;
    outboundSeatId: number;
    returnSeatId: number | null;
}

/** Matches the revised BookingRequestDto. */
export interface BookingRequest {
    outboundFlightId: number;
    returnFlightId: number | null;
    passengers: PassengerRequest[];
}

export interface PassengerResponse {
    id: number;
    firstName: string;
    lastName: string;
    passportNumber: string;
    email: string;
}

export interface BookingSeat {
    id: number;
    passengerId: number;
    flightId: number;
    seatNumber: string;
}

export interface BookingResponse {
    id: number;
    bookingReference: string;
    createdByEmail: string | null;
    bookingDate: string;
    cancelledAt: string | null;
    archivedAt: string | null;
    status: BookingStatus;
    tripType: TripType;
    outboundFlight: Flight;
    returnFlight: Flight | null;
    totalPrice: number;
    passengers: PassengerResponse[];
    seats: BookingSeat[];
}

export type Booking = BookingResponse;
