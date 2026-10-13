import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = new Set();
    this.subscription = null;
  }

  connect(userId, token) {
    if (this.client && this.connected) {
      return;
    }

    if (!token) {
      token = localStorage.getItem('token');
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Silenced in production, useful during debug
      }
    });

    this.client.onConnect = (frame) => {
      this.connected = true;

      // Subscribe to private notifications queue
      this.subscription = this.client.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          this.notifyListeners(notification);
        } catch (e) {
          console.error('Error parsing notification frame:', e);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.warn('STOMP error:', frame.headers['message']);
      this.connected = false;
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (e) {}
      this.subscription = null;
    }

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.client = null;
    }
    this.connected = false;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(notification) {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });
  }
}

export const wsService = new WebSocketService();
export default wsService;
