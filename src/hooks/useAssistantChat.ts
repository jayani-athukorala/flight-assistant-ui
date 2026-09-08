import { useCallback, useEffect, useState } from "react";
import { assistantService } from "../services/assistantService";
import type { AssistantResponse, AssistantUiMessage } from "../types/Assistant";

const STORAGE_KEY = "skyroute.assistant.session";

interface StoredSession {
    conversationId: string | null;
    messages: AssistantUiMessage[];
}

const emptySession: StoredSession = { conversationId: null, messages: [] };

const readSession = (): StoredSession => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return emptySession;
        const parsed = JSON.parse(stored) as StoredSession;
        return Array.isArray(parsed.messages) ? parsed : emptySession;
    } catch {
        return emptySession;
    }
};

export function useAssistantChat() {
    const [session, setSession] = useState<StoredSession>(readSession);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }, [session]);

    const appendLocalAssistant = useCallback((text: string, authenticationRequired = false) => {
        setSession((current) => ({
            ...current,
            messages: [...current.messages, {
                id: crypto.randomUUID(),
                role: "assistant",
                text,
                authenticationRequired,
            }],
        }));
    }, []);

    const send = useCallback(async (message: string, displayText?: string) => {
        if (loading) return;

        setSession((current) => ({
            ...current,
            messages: [...current.messages, {
                id: crypto.randomUUID(),
                role: "user",
                text: displayText ?? message,
            }],
        }));
        setLoading(true);

        try {
            const response: AssistantResponse = await assistantService.chat({
                conversationId: session.conversationId,
                message,
            });
            setSession((current) => ({
                conversationId: response.conversationId,
                messages: [...current.messages, {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    text: response.message,
                    response,
                }],
            }));
        } catch {
            setSession((current) => ({
                ...current,
                messages: [...current.messages, {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    text: "",
                    failedPrompt: message,
                }],
            }));
        } finally {
            setLoading(false);
        }
    }, [loading, session.conversationId]);

    const resetSession = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(emptySession);
    }, []);

    const clearConversation = useCallback(async () => {
        const conversationId = session.conversationId;
        resetSession();
        if (!conversationId) return;
        try {
            await assistantService.clearConversation(conversationId);
        } catch {
            // Clearing local history is still safe when the API is unavailable.
        }
    }, [resetSession, session.conversationId]);

    useEffect(() => {
        window.addEventListener("auth:identity-changed", resetSession);
        window.addEventListener("auth:logout", resetSession);
        return () => {
            window.removeEventListener("auth:identity-changed", resetSession);
            window.removeEventListener("auth:logout", resetSession);
        };
    }, [resetSession]);

    return { session, setSession, loading, send, appendLocalAssistant, clearConversation };
}
