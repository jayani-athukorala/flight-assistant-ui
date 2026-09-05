import api from "../api/axios";
import type { AssistantRequest, AssistantResponse } from "../types/Assistant";

const chat = async (request: AssistantRequest): Promise<AssistantResponse> => {
    const { data } = await api.post<AssistantResponse>("/assistant/chat", request);
    return data;
};

const confirmAction = async (
    conversationId: string,
    actionId: string,
): Promise<AssistantResponse> => {
    const { data } = await api.post<AssistantResponse>(
        `/assistant/conversations/${conversationId}/actions/${actionId}/confirm`,
    );
    return data;
};

const rejectAction = async (conversationId: string, actionId: string): Promise<void> => {
    await api.delete(`/assistant/conversations/${conversationId}/actions/${actionId}`);
};

const clearConversation = async (conversationId: string): Promise<void> => {
    await api.delete(`/assistant/conversations/${conversationId}`);
};

export const assistantService = { chat, confirmAction, rejectAction, clearConversation };
