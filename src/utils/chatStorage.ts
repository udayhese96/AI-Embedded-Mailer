import { ChatSession, TemplateCheckpoint, Message } from '../types/template';

const CHAT_SESSION_KEY = 'ai-chat-session';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * Save chat session to localStorage
 */
export function saveChatSession(session: ChatSession): boolean {
    try {
        const serialized = JSON.stringify(session);

        // Check size before saving
        if (serialized.length > MAX_STORAGE_SIZE) {
            console.warn('Chat session exceeds storage limit. Trimming old messages...');
            // Keep only last 50 messages
            const trimmedSession = {
                ...session,
                messages: session.messages.slice(-50),
            };
            localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(trimmedSession));
        } else {
            localStorage.setItem(CHAT_SESSION_KEY, serialized);
        }

        return true;
    } catch (error) {
        console.error('Failed to save chat session:', error);

        // Handle quota exceeded
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded. Clearing old data...');
            clearChatSession();
        }

        return false;
    }
}

/**
 * Load chat session from localStorage
 */
export function loadChatSession(): ChatSession | null {
    try {
        const stored = localStorage.getItem(CHAT_SESSION_KEY);

        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored);

        // Convert date strings back to Date objects
        return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            messages: parsed.messages.map((msg: any) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            })),
            checkpoints: parsed.checkpoints.map((cp: any) => ({
                ...cp,
                timestamp: new Date(cp.timestamp),
            })),
            currentTemplate: parsed.currentTemplate ? {
                ...parsed.currentTemplate,
                createdAt: new Date(parsed.currentTemplate.createdAt),
                updatedAt: new Date(parsed.currentTemplate.updatedAt),
            } : null,
        };
    } catch (error) {
        console.error('Failed to load chat session:', error);
        return null;
    }
}

/**
 * Clear chat session from localStorage
 */
export function clearChatSession(): void {
    try {
        localStorage.removeItem(CHAT_SESSION_KEY);
    } catch (error) {
        console.error('Failed to clear chat session:', error);
    }
}

/**
 * Save a checkpoint for a template
 */
export function saveCheckpoint(checkpoint: TemplateCheckpoint): boolean {
    try {
        const session = loadChatSession();

        if (!session) {
            return false;
        }

        // Add checkpoint to session
        session.checkpoints.push(checkpoint);
        session.updatedAt = new Date();

        return saveChatSession(session);
    } catch (error) {
        console.error('Failed to save checkpoint:', error);
        return false;
    }
}

/**
 * Load all checkpoints for a specific template
 */
export function loadCheckpoints(templateId: string): TemplateCheckpoint[] {
    try {
        const session = loadChatSession();

        if (!session) {
            return [];
        }

        return session.checkpoints
            .filter(cp => cp.templateId === templateId)
            .sort((a, b) => b.version - a.version); // Latest first
    } catch (error) {
        console.error('Failed to load checkpoints:', error);
        return [];
    }
}

/**
 * Delete a specific checkpoint
 */
export function deleteCheckpoint(checkpointId: string): boolean {
    try {
        const session = loadChatSession();

        if (!session) {
            return false;
        }

        session.checkpoints = session.checkpoints.filter(cp => cp.id !== checkpointId);
        session.updatedAt = new Date();

        return saveChatSession(session);
    } catch (error) {
        console.error('Failed to delete checkpoint:', error);
        return false;
    }
}

/**
 * Export chat history as JSON
 */
export function exportChatHistory(): string {
    const session = loadChatSession();

    if (!session) {
        return JSON.stringify({ error: 'No chat session found' });
    }

    return JSON.stringify(session, null, 2);
}

/**
 * Import chat history from JSON
 */
export function importChatHistory(json: string): boolean {
    try {
        const session = JSON.parse(json) as ChatSession;

        // Validate structure
        if (!session.id || !Array.isArray(session.messages)) {
            throw new Error('Invalid chat session format');
        }

        return saveChatSession(session);
    } catch (error) {
        console.error('Failed to import chat history:', error);
        return false;
    }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): { used: number; limit: number; percentage: number } {
    try {
        const session = loadChatSession();
        const used = session ? JSON.stringify(session).length : 0;

        return {
            used,
            limit: MAX_STORAGE_SIZE,
            percentage: (used / MAX_STORAGE_SIZE) * 100,
        };
    } catch (error) {
        return { used: 0, limit: MAX_STORAGE_SIZE, percentage: 0 };
    }
}
