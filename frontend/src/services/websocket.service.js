import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import API_CONFIG from '../config/api';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = {};
        this.isConnected = false;
    }

    connect(onConnected, onError) {
        if (this.isConnected) {
            if (onConnected) onConnected();
            return;
        }

        const socket = new SockJS(`${API_CONFIG.BASE_URL}/ws`);
        this.stompClient = Stomp.over(socket);

        // Disable debug logs in production
        if (!import.meta.env.DEV) {
            this.stompClient.debug = () => { };
        }

        this.stompClient.connect({}, () => {
            this.isConnected = true;
            console.log('WebSocket Connected');
            if (onConnected) onConnected();
        }, (error) => {
            console.error('WebSocket Connection Error:', error);
            this.isConnected = false;
            if (onError) onError(error);
            // Auto reconnect logic could go here
        });
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log('WebSocket Disconnected');
                this.isConnected = false;
            });
        }
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.isConnected) {
            console.warn('WebSocket not connected. Cannot subscribe to', topic);
            return null;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
            try {
                const parsedBody = JSON.parse(message.body);
                callback(parsedBody);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
                callback(message.body);
            }
        });

        this.subscriptions[topic] = subscription;
        return subscription;
    }

    unsubscribe(topic) {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
            delete this.subscriptions[topic];
        }
    }

    sendMessage(destination, body) {
        if (this.stompClient && this.isConnected) {
            this.stompClient.send(destination, {}, JSON.stringify(body));
        } else {
            console.warn('WebSocket not connected. Cannot send message to', destination);
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
