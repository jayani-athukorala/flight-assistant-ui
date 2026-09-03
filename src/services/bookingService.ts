import api from "../api/axios";
import type {
    BookingRequest,
    BookingResponse,
} from "../types/Booking";

export interface MyBookingsOptions {
    archived?: boolean;
}

export const bookFlight = async (
    booking: BookingRequest
): Promise<BookingResponse> => {
    const { data } = await api.post<BookingResponse>(
        "/bookings",
        booking
    );
    return data;
};

export const getMyBookings = async (
    options: MyBookingsOptions = {}
): Promise<BookingResponse[]> => {
    const { data } = await api.get<BookingResponse[]>(
        "/bookings/my",
        {
            params: {
                archived: options.archived ?? false,
            },
        }
    );
    return data;
};

export const cancelBooking = async (
    bookingId: number
): Promise<void> => {
    await api.patch(`/bookings/${bookingId}/cancel`);
};

export const archiveBooking = async (
    bookingId: number
): Promise<void> => {
    await api.patch(`/bookings/${bookingId}/archive`);
};

export const restoreBooking = async (
    bookingId: number
): Promise<void> => {
    await api.patch(`/bookings/${bookingId}/restore`);
};