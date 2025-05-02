import { io, Socket } from 'socket.io-client';
import { useStore } from './store';

// Update with your actual WebSocket server URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9000';

/**
 * Socket.IO service for real-time communication
 */
class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private disputeRoom: string | null = null;
  private connectionInProgress: boolean = false;

  /**
   * Initialize the socket connection
   */
  initialize(): Socket {
    if (this.socket) {
      console.log('Socket reuse: Using existing socket connection');
      return this.socket;
    }

    if (this.connectionInProgress) {
      console.log('Socket connection already in progress, waiting...');
      return this.createDummySocket();
    }

    this.connectionInProgress = true;
    const token = useStore.getState().auth.token;
    
    console.log('Socket connecting to:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      // Allow polling as a fallback when WebSocket fails
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000, // Start with 1s delay
      reconnectionDelayMax: 5000, // Max 5s delay
      forceNew: false, // Don't force new connection if one exists
      timeout: 20000 // Increase connection timeout
    });

    this.setupEventHandlers();
    this.connectionInProgress = false;
    return this.socket;
  }

  /**
   * Create a dummy socket with no-op methods for when a connection is in progress
   * This prevents errors if multiple components try to initialize at once
   */
  private createDummySocket(): Socket {
    const dummySocket = {
      on: () => dummySocket,
      emit: () => dummySocket,
      connected: false,
    } as unknown as Socket;
    
    // Wait for the actual socket to be created
    setTimeout(() => {
      if (this.socket) {
        console.log('Real socket now available, retrying operations');
      }
    }, 500);
    
    return dummySocket;
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully!', this.socket?.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      
      // Check transport type
      const transport = this.socket?.io.engine.transport.name;
      console.log(`Socket transport being used: ${transport}`);
      
      // Rejoin dispute room if we were in one
      if (this.disputeRoom) {
        this.joinDisputeRoom(this.disputeRoom);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.log('Max reconnect attempts reached, falling back to polling if available');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
    });
    
    // Listen for transport changes (WebSocket ↔ Polling)
    this.socket.io.engine.on('upgrade', (transport) => {
      console.log(`Socket transport upgraded to: ${transport.name}`);
    });
    
    this.socket.io.engine.on('downgrade', (transport) => {
      console.log(`Socket transport downgraded to: ${transport.name}`);
    });
  }

  /**
   * Join a dispute chat room
   */
  joinDisputeRoom(disputeId: string): void {
    if (!this.socket || !this.connected) {
      this.initialize();
    }
    
    this.disputeRoom = disputeId;
    this.socket?.emit('join:dispute', { disputeId });
    console.log(`Joined dispute room: ${disputeId}`);
  }

  /**
   * Leave the current dispute chat room
   */
  leaveDisputeRoom(): void {
    if (this.socket && this.disputeRoom) {
      this.socket.emit('leave:dispute', { disputeId: this.disputeRoom });
      console.log(`Left dispute room: ${this.disputeRoom}`);
      this.disputeRoom = null;
    }
  }

  /**
   * Send a message in the dispute chat
   */
  sendMessage(message: {
    text: string;
    disputeId: string;
    attachment?: { name: string; url: string; type: string };
  }): void {
    if (!this.socket || !this.connected) {
      console.error('Socket not connected, cannot send message');
      // Try to reconnect
      this.initialize();
      setTimeout(() => this.sendMessage(message), 500);
      return;
    }

    const { userType } = useStore.getState().auth;
    
    this.socket.emit('message:send', {
      ...message,
      sender: userType, // 'buyer' or 'seller'
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get current socket ID if connected
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.disputeRoom = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current transport method (websocket or polling)
   */
  getTransport(): string | null {
    return this.socket?.io.engine.transport.name || null;
  }

  /**
   * Force reconnection with WebSocket transport
   */
  forceReconnect(): void {
    this.disconnect();
    this.socket = null;
    this.initialize();
  }
}

// Export as singleton
export const socketService = new SocketService();