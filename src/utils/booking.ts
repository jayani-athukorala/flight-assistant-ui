import type {
    PassengerRequest,
} from "../types/Booking";

import type {
    SeatClass,
} from "../types/Flight";

export const SEAT_CLASS_LABELS: Record<SeatClass, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "Premium Economy",
    BUSINESS: "Business",
    FIRST_CLASS: "First Class",
};

export const formatSeatClass = (
    seatClass: SeatClass
): string => {
    return SEAT_CLASS_LABELS[seatClass];
};

export const formatDate = (
    value: string
): string => {
    return new Date(value).toLocaleDateString();
};

export const formatTime = (
    value: string
): string => {
    return new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDateTime = (
    value: string
): string => {
    return new Date(value).toLocaleString();
};

export const formatPrice = (
    value: number
): string => {
    return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
}).format(value);
};

export const getPassengerName = (
    passenger: PassengerRequest
): string => {
    return `${passenger.firstName} ${passenger.lastName}`.trim();
};

export const hasPassengerDetails = (
    passenger: PassengerRequest
): boolean => {
    return Boolean(
        passenger.firstName ||
        passenger.lastName ||
        passenger.passportNumber ||
        passenger.email
    );
};

export const createEmptyPassenger = (): PassengerRequest => ({
    firstName: "",
    lastName: "",
    passportNumber: "",
    email: "",
    outboundSeatId: 0,
    returnSeatId: null,
});