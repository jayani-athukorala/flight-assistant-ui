import api from "./axios";
import type { BookingRequest } from "../types/Booking";
import type { Flight } from "../types/Flight";

export const getFlights = async (): Promise<Flight[]> => {
    const response = await api.get<Flight[]>("/flights");
    return response.data;
};

export const getAvailableFlights = async (): Promise<Flight[]> => {
    const response = await api.get<Flight[]>("/flights/available");
    return response.data;
};

export const getFlightById = async (
    id: number
): Promise<Flight> => {
    const response = await api.get<Flight>(
        `/flights/${id}`
    );

    return response.data;
};

export const bookFlight = async (
    flightId: number,
    data: BookingRequest
) => {
    const response = await api.post(
        `/flights/${flightId}/book`,
        data
    );

    return response.data;
};

export const getBookings = async () => {
    const response = await api.get(
        "/flights/bookings/my"
    );

    return response.data;
};

export const cancelBooking = async (
    bookingId: number
) => {
    const response = await api.delete(
        `/flights/${bookingId}/cancel`
    );

    return response.data;
};