import api from "../api/axios";
import type { Airport } from "../types/Airport";

export const searchAirports = async (
    query: string,
    signal?: AbortSignal
): Promise<Airport[]> => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
        return [];
    }

    const { data } = await api.get<Airport[]>("/airports/search", {
        params: { q: normalizedQuery, limit: 8 },
        signal,
    });

    return data;
};