import type { AssistantResponse } from "../types/Assistant";

function cleanModelText(text: string): string {
    if (!text) return "";

    return text
        .replace(/```json[\s\S]*?```/gi, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(
            /(?:please reply with|provide) an array of passengers[\s\S]*?(?=example format\s*:|notes\s*:|$)/gi,
            "Please provide each passenger's first name, last name, passport number, email, and selected seat number.\n\n",
        )
        .replace(/\bStructured\s+(result|info|data)\s*:[\s\S]*$/gi, "")
        .replace(/\bFlight\s*:\s*\{[\s\S]*?\}\s*/gi, "")
        .replace(/\bAvailable seats\s*:\s*\[[\s\S]*?\]\s*/gi, "")
        .replace(/\bExample format\s*:\s*\[[\s\S]*?\]\s*/gi, "")
        .replace(/\[\s*\{[\s\S]*?\}\s*]\s*/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\bSelected flight\s*(?:\(please confirm\))?\s*:[\s\S]*$/gi, "I found the selected flight. You can review the flight and continue below.")

        .trim();
}

export function formatAssistantText(
    originalText: string,
    response?: AssistantResponse,
): string {
    const cleanedText = cleanModelText(originalText);
    if (!response) return cleanModelText(originalText);

    if (response.requiresConfirmation) {
        return "Please review the details below and confirm if you would like to continue.";
    }

    if (response.flights.length > 0) {
        const flights = [...response.flights].sort(
            (first, second) =>
                new Date(first.departureTime).getTime() -
                new Date(second.departureTime).getTime(),
        );
        const firstFlight = flights[0];
        const origin = firstFlight.origin.city || firstFlight.origin.code;
        const destination = firstFlight.destination.city || firstFlight.destination.code;

        return flights.length === 1
            ? `I found one available flight from ${origin} to ${destination}. Select it below to continue.`
            : `I found available flights from ${origin} to ${destination}. Showing the next ${Math.min(flights.length, 10)} departures below.`;
    }

    if (response.availableSeats.length > 0) {
        const count = response.availableSeats.length;
        return count === 1
            ? "I found one available seat. Tell me who will travel in this seat."
            : `I found ${count} available seats. Tell me which seat numbers you would like and who will use each seat.`;
    }

    if (response.bookings.length > 0) {
        const count = response.bookings.length;
        return `${count === 1 ? "This is your current booking" : `These are your ${count} current bookings`}. Review the details below. To cancel one, click the Cancel booking button on the booking you wish to cancel, then confirm your choice.`;
    }

    if (
    response.type === "AIRPORT_RESULTS" && response.airports.length > 0
    ) {
        if (/did you mean/i.test(cleanedText)) {
            return cleanedText;
        }

        return response.airports.length === 1
            ? "I found one matching airport."
            : `I found ${response.airports.length} matching airports.`;
    }

    if (response.type === "AUTHENTICATION_REQUIRED") {
        return "You need to sign in before I can view or manage your bookings. Choose Sign in or Create account below; the form will open here in the assistant and your task will continue afterward.";
    }

    if (response.type === "ERROR") {
        return cleanModelText(originalText) || "I couldn't complete that request. Please try again.";
    }

    return cleanedText;
}
