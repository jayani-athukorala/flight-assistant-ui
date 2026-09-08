import type {Airport} from "./Airport";

export type SeatClass =
    | "ECONOMY"
    | "PREMIUM_ECONOMY"
    | "BUSINESS"
    | "FIRST_CLASS";


export interface Flight {
    id: number;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    status: string;
    airline: string;
    origin: Airport;
    destination: Airport;
    startingPrice: number | null;
}

export interface FlightSeat {
    id: number;
    seatNumber: string;
    seatClass: SeatClass;
    price: number;
}

export interface CreateFlightRequest {
    flightNumber: string;
    airline: string;
    originAirportId: number;
    destinationAirportId: number;
    departureTime: string;
    arrivalTime: string;
    economyBasePrice: number;
}
