import api from './api.service';

/**
 * AI Chatbot Service
 * Handles communication with AI assistant
 */
class ChatbotService {
    /**
     * Send a message to the AI chatbot
     * @param {string} message - User message
     * @returns {Promise<Object>} Chat response with message and suggestions
     */
    async sendMessage(message) {
        try {
            const response = await api.post('/api/bff/v1/ai/chat', { message });
            return response.data;
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
            await api.delete('/api/bff/v1/ai/chat/conversation');
        } catch (error) {
            console.error('Failed to clear conversation:', error);
            throw error;
        }
    }
}

export default new ChatbotService();
