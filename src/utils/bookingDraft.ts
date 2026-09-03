import type {
    PassengerRequest,
    TripType,
} from "../types/Booking";

import type {
    Flight,
    SeatClass,
} from "../types/Flight";

export interface BookingDraft {
    outboundFlight: Flight;
    returnFlight?: Flight;
    tripType: TripType;
    seatClass: SeatClass;
    passengers: PassengerRequest[];
    seatPrices: Record<string, number>;
    selectingReturn: boolean;
}

const STORAGE_KEY =
    "flight_booking_draft";

export const saveBookingDraft = (
    draft: BookingDraft
): void => {
    try {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(draft)
        );
    } catch {
        // Ignore storage errors.
    }
};

export const getBookingDraft =
    (): BookingDraft | null => {
        try {
            const value =
                sessionStorage.getItem(
                    STORAGE_KEY
                );

            if (!value) {
                return null;
            }

            return JSON.parse(
                value
            ) as BookingDraft;
        } catch {
            return null;
        }
    };

export const clearBookingDraft = (): void => {
    try {
        sessionStorage.removeItem(
            STORAGE_KEY
        );
    } catch {
        // Ignore storage errors.
    }
};