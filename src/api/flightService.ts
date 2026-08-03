import api from "./axios";

export const getFlights = async () => {
    const response = await api.get("/flights");
    return response.data;
};

export const getAvailableFlights = async () => {
    const response = await api.get("/flights/available");
    return response.data;
};

export const bookFlight = async (
    flightId: number,
    passengerName: string,
    passengerEmail: string
) => {
    const response = await api.post(
        `/flights/${flightId}/book`,
        {
            passengerName,
            passengerEmail,
        }
    );

    return response.data;
};

export const getBookings = async (
    email: string
) => {
    const response = await api.get(
        `/flights/bookings?email=${email}`
    );

    return response.data;
};

export const cancelBooking = async (
    flightId: number,
    email: string
) => {
    const response = await api.delete(
        `/flights/${flightId}/cancel?email=${email}`
    );

    return response.data;
};

