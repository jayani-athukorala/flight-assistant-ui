import { useCallback, useEffect, useState } from "react";
import { assistantService } from "../../services/assistantService";
import type { AssistantResponse, AssistantUiMessage } from "../../types/Assistant";
import AssistantButton from "./AssistantButton";
import AssistantPanel from "./AssistantPanel";

const STORAGE_KEY = "skyroute.assistant.session";

interface StoredSession { conversationId: string | null; messages: AssistantUiMessage[] }
const emptySession: StoredSession = { conversationId: null, messages: [] };

const readSession = (): StoredSession => {
    try {
        const value = sessionStorage.getItem(STORAGE_KEY);
        if (!value) return emptySession;
        const parsed = JSON.parse(value) as StoredSession;
        return Array.isArray(parsed.messages) ? parsed : emptySession;
    } catch { return emptySession; }
};

const uiMessage = (response: AssistantResponse): AssistantUiMessage => ({
    id: crypto.randomUUID(), role: "assistant", text: response.message, response,
});

export default function AssistantWidget() {
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState<StoredSession>(readSession);
    const [loading, setLoading] = useState(false);

    useEffect(() => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }, [session]);

    const appendResponse = useCallback((response: AssistantResponse) => {
        setSession((current) => ({ conversationId: response.conversationId, messages: [...current.messages, uiMessage(response)] }));
    }, []);

    const send = useCallback(async (message: string) => {
        if (loading) return;
        const userMessage: AssistantUiMessage = { id: crypto.randomUUID(), role: "user", text: message };
        setSession((current) => ({ ...current, messages: [...current.messages, userMessage] }));
        setLoading(true);
        try {
            const response = await assistantService.chat({ conversationId: session.conversationId, message });
            appendResponse(response);
        } catch {
            setSession((current) => ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), role: "assistant", text: "", failedPrompt: message }] }));
        } finally { setLoading(false); }
    }, [appendResponse, loading, session.conversationId]);

    const settleAction = (actionId: string) => setSession((current) => ({ ...current, messages: current.messages.map((item) => item.response?.pendingAction?.actionId === actionId ? { ...item, response: { ...item.response, requiresConfirmation: false, pendingAction: null } } : item) }));

    const confirm = async (actionId: string) => {
        if (!session.conversationId || loading) return;
        setLoading(true);
        try { const response = await assistantService.confirmAction(session.conversationId, actionId); settleAction(actionId); appendResponse(response); }
        catch { setSession((current) => ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), role: "assistant", text: "", failedPrompt: "Please confirm the pending action" }] })); }
        finally { setLoading(false); }
    };

    const reject = async (actionId: string) => {
        if (!session.conversationId || loading) return;
        setLoading(true);
        try {
            await assistantService.rejectAction(session.conversationId, actionId);
            settleAction(actionId);
            setSession((current) => ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), role: "assistant", text: "Okay, I did not perform that action." }] }));
        } catch { setSession((current) => ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), role: "assistant", text: "", failedPrompt: "Please reject the pending action" }] })); }
        finally { setLoading(false); }
    };

    const clear = async () => {
        const id = session.conversationId;
        setSession(emptySession);
        if (id) { try { await assistantService.clearConversation(id); } catch { /* Local history is still safely cleared. */ } }
    };

    useEffect(() => {
        const resetAssistantSession = () => {
            /*
            * Do not call the backend clear endpoint here.
            * The old conversation belongs to the previous identity.
            * It will expire automatically through the backend TTL.
            */
            sessionStorage.removeItem(STORAGE_KEY);
            setSession({
                conversationId: null,
                messages: [],
            });
        };

        window.addEventListener(
            "auth:identity-changed",
            resetAssistantSession
        );

        window.addEventListener(
            "auth:logout",
            resetAssistantSession
        );

        return () => {
            window.removeEventListener(
                "auth:identity-changed",
                resetAssistantSession
            );

            window.removeEventListener(
                "auth:logout",
                resetAssistantSession
            );
        };
    }, []);

    return <><AssistantButton open={open} onClick={() => setOpen((value) => !value)}/>{open && <AssistantPanel messages={session.messages} loading={loading} onClose={() => setOpen(false)} onClear={clear} onSend={send} onConfirm={confirm} onReject={reject}/>}</>;
}
