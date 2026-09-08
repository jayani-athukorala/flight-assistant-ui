import type { Airport } from "./Airport";
import type { BookingResponse } from "./Booking";
import type { Flight, FlightSeat } from "./Flight";

export type AssistantResponseType =
    | "TEXT"
    | "AIRPORT_RESULTS"
    | "FLIGHT_RESULTS"
    | "SEAT_RESULTS"
    | "PASSENGER_DETAILS_REQUIRED"
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

export interface PassengerSeatPair {
    outboundSeatId: number;
    outboundSeatNumber: string;
    returnSeatId: number | null;
    returnSeatNumber: string | null;
}

export interface PassengerFormSpec {
    outboundFlightId: number;
    returnFlightId: number | null;
    seatPairs: PassengerSeatPair[];
}

export interface AssistantResponse {
    conversationId: string;
    message: string;
    type: AssistantResponseType;
    airports: Airport[];
    flights: Flight[];
    availableSeats: (FlightSeat & { available?: boolean })[];
    bookings: BookingResponse[];
    passengerForm: PassengerFormSpec | null;
    requiresConfirmation: boolean;
    pendingAction: PendingAssistantAction | null;
}

export interface AssistantUiMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    response?: AssistantResponse;
    failedPrompt?: string;
    authenticationRequired?: boolean;
}

import api from "../api/axios";


const chat = async (request: AssistantRequest): Promise<AssistantResponse> => {
    const { data } = await api.post<AssistantResponse>("/assistant/chat", request);
    return data;
};

const clearConversation = async (conversationId: string): Promise<void> => {
    await api.delete(`/assistant/conversations/${conversationId}`);
};

export const assistantService = { chat, clearConversation };
