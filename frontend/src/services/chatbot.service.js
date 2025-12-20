import api from './api.service';

/**
 * AI Chatbot Service
 * Handles communication with AI assistant
 */
class ChatbotService {
    /**
     * Get user ID from localStorage or generate anonymous ID
     */
    getUserId() {
        // Try to get user ID from localStorage (if logged in)
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.id || userData.userId || this.getAnonymousId();
            } catch (e) {
                return this.getAnonymousId();
            }
        }
        return this.getAnonymousId();
    }

    /**
     * Get or create anonymous user ID for non-logged-in users
     */
    getAnonymousId() {
        let anonymousId = sessionStorage.getItem('anonymousChatId');
        if (!anonymousId) {
            anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem('anonymousChatId', anonymousId);
        }
        return anonymousId;
    }

    /**
     * Send a message to the AI chatbot
     * @param {string} message - User message
     * @returns {Promise<Object>} Chat response with message and suggestions
     */
    async sendMessage(message) {
        try {
            const userId = this.getUserId();

            const response = await api.post('/api/bff/v1/ai/chat',
                { message },
                {
                    headers: {
                        'X-User-Id': userId
                    }
                }
            );

            // Unwrap response.data.data structure
            return response.data || response;
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    }

    /**
     * Clear conversation history
     * @returns {Promise<void>}
     */
    async clearConversation() {
        try {
            const userId = this.getUserId();

            await api.delete('/api/bff/v1/ai/chat/conversation', {
                headers: {
                    'X-User-Id': userId
                }
            });
        } catch (error) {
            console.error('Failed to clear conversation:', error);
            throw error;
        }
    }
}

export default new ChatbotService();
