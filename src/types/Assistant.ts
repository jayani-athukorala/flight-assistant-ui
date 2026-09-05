import type { Airport } from "./Airport";
import type { BookingResponse } from "./Booking";
import type { Flight, FlightSeat } from "./Flight";

export type AssistantResponseType =
    | "TEXT"
    | "AIRPORT_RESULTS"
    | "FLIGHT_RESULTS"
    | "SEAT_RESULTS"
    | "BOOKING_RESULTS"
    | "AUTHENTICATION_REQUIRED"
    | "CONFIRMATION_REQUIRED"
    | "BOOKING_COMPLETED"
    | "CANCELLATION_COMPLETED"
    | "ERROR";

export type PendingActionType = "CREATE_BOOKING" | "CANCEL_BOOKING";

export interface PendingAssistantAction {
    actionId: string;
    type: PendingActionType;
    description: string;
    parameters: Record<string, unknown>;
    expiresAt: string;
}

export interface AssistantRequest {
    conversationId: string | null;
    message: string;
}

export interface AssistantResponse {
    conversationId: string;
    message: string;
    type: AssistantResponseType;
    airports: Airport[];
    flights: Flight[];
    availableSeats: (FlightSeat & { available?: boolean })[];
    bookings: BookingResponse[];
    requiresConfirmation: boolean;
    pendingAction: PendingAssistantAction | null;
}

export interface AssistantUiMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    response?: AssistantResponse;
    failedPrompt?: string;
}
