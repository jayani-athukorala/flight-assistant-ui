export interface FlightInfo {
    id: number;
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    status: string;
}

export interface Passenger {
    firstName: string;
    lastName: string;
    passportNumber: string;
    email: string;
}

export interface FlightSeat {
    id: number;
    seatNumber: string;
    seatClass: string;
    price: number;
}

export interface Booking {
    id: number;
    bookingReference: string;
    status: string;
    tripType: string;
    totalPrice: number;

    outboundFlight: FlightInfo;
    returnFlight?: FlightInfo | null;

    passengers: Passenger[];
    seats: FlightSeat[];
}

export interface PassengerRequest {
    firstName: string;
    lastName: string;
    passportNumber: string;
    email: string;
}


export interface BookingRequest {

    outboundFlightId: number;
    returnFlightId: number | null;
    tripType: "ONE_WAY" | "ROUND_TRIP";
    seatClass: "ECONOMY" | "BUSINESS";
    passengers: PassengerRequest[];

}