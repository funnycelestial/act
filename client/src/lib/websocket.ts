// Note: socket.io-client is not available in this environment
// This is a mock implementation for demonstration

interface MockSocket {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

export interface WebSocketEvents {
  // Connection events
  connected: (data: { message: string; anonymousId: string; timestamp: string }) => void;
  disconnect: () => void;
  error: (error: { message: string }) => void;

  // Auction events
  bid_placed: (data: { auctionId: string; bidder: string; amount: number; isNewHighest: boolean }) => void;
  auction_ended: (data: { auctionId: string; winner?: any; endedBy: string }) => void;
  auction_extended: (data: { auctionId: string; newEndTime: string; extensionTime: number }) => void;
  auction_watched: (data: { auctionId: string; watcherCount: number }) => void;
  auction_unwatched: (data: { auctionId: string; watcherCount: number }) => void;
  user_joined_auction: (data: { anonymousId: string; timestamp: string }) => void;
  user_left_auction: (data: { anonymousId: string; timestamp: string }) => void;
  user_typing: (data: { anonymousId: string; isTyping: boolean }) => void;

  // Notification events
  new_notification: (notification: {
    notificationId: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    data?: any;
    timestamp: string;
  }) => void;
  notification_read: (data: { notificationId: string }) => void;

  // System events
  system_maintenance: (data: { message: string; timestamp: string }) => void;
  security_alert: (data: { message: string; severity: string; timestamp: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventHandlers();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', { 
        message: 'Connected to auction platform',
        anonymousId: '',
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnect');
      
      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', { message: error.message });
      this.handleReconnect();
    });

    // Auction events
    this.socket.on('bid_update', (data) => this.emit('bid_placed', data));
    this.socket.on('auction_ended', (data) => this.emit('auction_ended', data));
    this.socket.on('auction_extended', (data) => this.emit('auction_extended', data));
    this.socket.on('auction_watched', (data) => this.emit('auction_watched', data));
    this.socket.on('auction_unwatched', (data) => this.emit('auction_unwatched', data));
    this.socket.on('user_joined_auction', (data) => this.emit('user_joined_auction', data));
    this.socket.on('user_left_auction', (data) => this.emit('user_left_auction', data));
    this.socket.on('user_typing', (data) => this.emit('user_typing', data));

    // Notification events
    this.socket.on('new_notification', (data) => this.emit('new_notification', data));
    this.socket.on('notification_read', (data) => this.emit('notification_read', data));

    // System events
    this.socket.on('system_maintenance', (data) => this.emit('system_maintenance', data));
    this.socket.on('security_alert', (data) => this.emit('security_alert', data));
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, delay);
  }

  // Event emission and listening
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in WebSocket event listener for ${event}:`, error);
      }
    });
  }

  on<K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off<K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Auction room management
  joinAuction(auctionId: string) {
    this.socket?.emit('join_auction', auctionId);
  }

  leaveAuction(auctionId: string) {
    this.socket?.emit('leave_auction', auctionId);
  }

  placeBid(auctionId: string, amount: number) {
    this.socket?.emit('place_bid', { auctionId, amount });
  }

  watchAuction(auctionId: string) {
    this.socket?.emit('watch_auction', auctionId);
  }

  unwatchAuction(auctionId: string) {
    this.socket?.emit('unwatch_auction', auctionId);
  }

  startTyping(auctionId: string) {
    this.socket?.emit('typing_start', { auctionId });
  }

  stopTyping(auctionId: string) {
    this.socket?.emit('typing_stop', { auctionId });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();