export interface Booking {

    id: number;
    flightId: number;
    flightNumber: string;
    passengerName: string;
    passengerEmail: string;
    destination: string;
    departureTime: string;
    status: string;
}