import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface OrderUpdate {
  orderId: number;
  status: string;
  message: string;
  timestamp: number;
}

interface BillUpdate {
  billId: number;
  totalAmount?: number;
  message: string;
  timestamp: number;
}

interface StaffMessage {
  message: string;
  type: string;
  timestamp: number;
  fromStaff: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  joinTable: (tableId: number, sessionId?: string) => void;
  leaveTable: (tableId: number) => void;
  sendMessageToStaff: (tableId: number, message: string, type: string) => void;
  orderUpdates: OrderUpdate[];
  billUpdates: BillUpdate[];
  staffMessages: StaffMessage[];
  clearNotifications: () => void;
  reconnect: () => void;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [billUpdates, setBillUpdates] = useState<BillUpdate[]>([]);
  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;
  const reconnectDelay = 2000;

  const connectSocket = useCallback(() => {
    if (connecting || (socket && socket.connected)) return;

    setConnecting(true);

    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false, // Handle manually for better control
      timeout: 5000,
      forceNew: true,
    });

    const setupSocketEventHandlers = (socket: Socket) => {

      // Connection event handlers
      socket.on('connect', () => {
        setConnected(true);
        setConnecting(false);
        setConnectionAttempts(0);

        // Start ping interval to maintain connection health
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (socket.connected) {
            socket.emit('ping');
          }
        }, 30000); // Ping every 30 seconds
      });

      socket.on('disconnect', (reason) => {
        setConnected(false);
        setConnecting(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Only attempt reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && connectionAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        setConnecting(false);
        if (connectionAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      socket.on('pong', () => {
        // Connection is healthy
      });

      // Customer-specific event handlers
      socket.on('joined_table', (data) => {
        // Table joined successfully
      });

      socket.on('left_table', (data) => {
        // Table left successfully
      });

      // Order status updates
      socket.on('order_created', (data) => {
        const update: OrderUpdate = {
          orderId: data.orderId,
          status: 'PENDING',
          message: data.message || 'Your order has been received!',
          timestamp: data.timestamp || Date.now(),
        };
        setOrderUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Order Confirmed', {
            body: update.message,
            icon: '/favicon.ico',
          });
        }

        // Trigger a custom event for components to listen to
        window.dispatchEvent(new CustomEvent('orderCreated', { detail: data }));
      });

      socket.on('order_status_updated', (data) => {
        const update: OrderUpdate = {
          orderId: data.orderId,
          status: data.status,
          message: data.message || `Order status: ${data.status}`,
          timestamp: data.timestamp || Date.now(),
        };
        setOrderUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Order Update', {
            body: update.message,
            icon: '/favicon.ico',
          });
        }

        window.dispatchEvent(new CustomEvent('orderStatusUpdated', { detail: data }));
      });

      // Bill updates
      socket.on('bill_created', (data) => {
        const update: BillUpdate = {
          billId: data.billId,
          totalAmount: data.totalAmount,
          message: data.message || 'Your bill is ready!',
          timestamp: data.timestamp || Date.now(),
        };
        setBillUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Bill Ready', {
            body: `${update.message} Total: $${data.totalAmount}`,
            icon: '/favicon.ico',
          });
        }

        window.dispatchEvent(new CustomEvent('billCreated', { detail: data }));
      });

      socket.on('bill_updated', (data) => {
        const update: BillUpdate = {
          billId: data.billId,
          totalAmount: data.totalAmount,
          message: data.message || 'Your bill has been updated',
          timestamp: data.timestamp || Date.now(),
        };
        setBillUpdates(prev => [update, ...prev.slice(0, 9)]);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Bill Updated', {
            body: `${update.message} New total: $${data.totalAmount}`,
            icon: '/favicon.ico',
          });
        }

        window.dispatchEvent(new CustomEvent('billUpdated', { detail: data }));
      });

      socket.on('bill_paid', (data) => {
        const update: BillUpdate = {
          billId: data.billId,
          message: data.message || 'Thank you for your payment!',
          timestamp: data.timestamp || Date.now(),
        };
        setBillUpdates(prev => [update, ...prev.slice(0, 9)]);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Payment Confirmed', {
            body: update.message,
            icon: '/favicon.ico',
          });
        }

        window.dispatchEvent(new CustomEvent('billPaid', { detail: data }));
      });

      // Staff messages
      socket.on('staff_message', (data) => {
        const message: StaffMessage = {
          message: data.message,
          type: data.type || 'info',
          timestamp: data.timestamp || Date.now(),
          fromStaff: true,
        };
        setStaffMessages(prev => [message, ...prev.slice(0, 9)]);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Message from Staff', {
            body: message.message,
            icon: '/favicon.ico',
          });
        }

        window.dispatchEvent(new CustomEvent('staffMessage', { detail: data }));
      });

      // System messages
      socket.on('system_message', (data) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Restaurant Notice', {
            body: data.message,
            icon: '/favicon.ico',
          });
        }

        window.dispatchEvent(new CustomEvent('systemMessage', { detail: data }));
      });

      // Table status events
      socket.on('table_status_changed', (data) => {
        // Handle table status change - might affect current session
        window.dispatchEvent(new CustomEvent('tableStatusChanged', { detail: data }));
      });

      socket.on('session_ended', (data) => {
        // Handle session ended - this might affect the current customer's session
        window.dispatchEvent(new CustomEvent('sessionEnded', { detail: data }));
      });

      // Error handler
      socket.on('error', (data) => {
        console.error('Socket error:', data.message || 'Unknown error');
      });
    };

    setupSocketEventHandlers(newSocket);
    setSocket(newSocket);
  }, [connecting, socket, connectionAttempts]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionAttempts(prev => prev + 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectSocket();
    }, reconnectDelay * Math.min(connectionAttempts + 1, 5)); // Exponential backoff
  }, [connectSocket, connectionAttempts]);

  useEffect(() => {
    connectSocket();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (socket) {
        socket.removeAllListeners();
        socket.close();
      }
    };
  }, []);

  // Helper functions
  const joinTable = useCallback((tableId: number, sessionId?: string) => {
    if (socket && connected) {
      socket.emit('join_table', { tableId, sessionId });
    }
  }, [socket, connected]);

  const leaveTable = useCallback((tableId: number) => {
    if (socket && connected) {
      socket.emit('leave_table', { tableId });
    }
  }, [socket, connected]);

  const sendMessageToStaff = useCallback((tableId: number, message: string, type: string = 'info') => {
    if (socket && connected) {
      socket.emit('customer_message_to_staff', { tableId, message, type });
    }
  }, [socket, connected]);

  const clearNotifications = useCallback(() => {
    setOrderUpdates([]);
    setBillUpdates([]);
    setStaffMessages([]);
  }, []);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.removeAllListeners();
      socket.close();
    }
    setConnectionAttempts(0);
    connectSocket();
  }, [socket, connectSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        connecting,
        connectionAttempts,
        maxReconnectAttempts,
        joinTable,
        leaveTable,
        sendMessageToStaff,
        orderUpdates,
        billUpdates,
        staffMessages,
        clearNotifications,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};