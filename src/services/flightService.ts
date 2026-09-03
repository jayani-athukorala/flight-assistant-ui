import api from "../api/axios";
import type {
    Flight,
    FlightSeat,
    SeatClass,
} from "../types/Flight";

export interface FlightAdminSearchParams {
    date?: string;
    status?: string;
    query?: string;
}

export const getFlights = async (
    params: FlightAdminSearchParams = {}
): Promise<Flight[]> => {
    const { data } = await api.get<Flight[]>("/flights", {
        params,
    });

    return data;
};

export interface AvailableFlightParams {
    originId: number;
    destinationId: number;
    date?: string;
}

export const getAvailableFlights = async (
    params: AvailableFlightParams
): Promise<Flight[]> => {
    const { data } = await api.get<Flight[]>(
        "/flights/available",
        { params }
    );

    return data;
};

export const getFlightById = async (
    flightId: number
): Promise<Flight> => {
    const { data } = await api.get<Flight>(
        `/flights/${flightId}`
    );

    return data;
};

export const getReturnFlights = async (
    originId: number,
    destinationId: number,
    date?: string
): Promise<Flight[]> => {
    return getAvailableFlights({
        originId,
        destinationId,
        date,
    });
};

export const getAvailableSeats = async (
    flightId: number,
    seatClass: SeatClass
): Promise<FlightSeat[]> => {
    const { data } = await api.get<FlightSeat[]>(
        `/flights/${flightId}/seats/class`,
        {
            params: { seatClass },
        }
    );

    return data;
};