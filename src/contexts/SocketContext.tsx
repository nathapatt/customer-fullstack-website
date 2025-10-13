import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  joinTable: (tableId: number, sessionId?: string) => void;
  leaveTable: (tableId: number) => void;
  sendMessageToStaff: (tableId: number, message: string, type: string) => void;
  orderUpdates: OrderUpdate[];
  billUpdates: BillUpdate[];
  staffMessages: StaffMessage[];
  clearNotifications: () => void;
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
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [billUpdates, setBillUpdates] = useState<BillUpdate[]>([]);
  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>([]);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Customer connected to WebSocket server:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Customer disconnected from WebSocket server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Customer connection error:', error);
    });

    // Customer-specific event handlers
    newSocket.on('joined_table', (data) => {
      console.log('🍽️ Joined table room:', data);
    });

    newSocket.on('left_table', (data) => {
      console.log('🍽️ Left table room:', data);
    });

    // Order status updates
    newSocket.on('order_created', (data) => {
      console.log('📋 Order confirmation received:', data);
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

    newSocket.on('order_status_updated', (data) => {
      console.log('📋 Order status updated:', data);
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
    newSocket.on('bill_created', (data) => {
      console.log('💰 Bill created:', data);
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

    newSocket.on('bill_updated', (data) => {
      console.log('💰 Bill updated:', data);
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

    newSocket.on('bill_paid', (data) => {
      console.log('💰 Bill paid confirmation:', data);
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
    newSocket.on('staff_message', (data) => {
      console.log('💬 Message from staff:', data);
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
    newSocket.on('system_message', (data) => {
      console.log('📢 System message:', data);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Restaurant Notice', {
          body: data.message,
          icon: '/favicon.ico',
        });
      }

      window.dispatchEvent(new CustomEvent('systemMessage', { detail: data }));
    });

    // Error handler
    newSocket.on('error', (data) => {
      console.error('🔴 Socket error:', data);
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('🔌 Customer cleaning up WebSocket connection');
      newSocket.close();
    };
  }, []);

  // Helper functions
  const joinTable = (tableId: number, sessionId?: string) => {
    if (socket && connected) {
      console.log(`🍽️ Joining table ${tableId}${sessionId ? ` with session ${sessionId}` : ''}`);
      socket.emit('join_table', { tableId, sessionId });
    }
  };

  const leaveTable = (tableId: number) => {
    if (socket && connected) {
      console.log(`🍽️ Leaving table ${tableId}`);
      socket.emit('leave_table', { tableId });
    }
  };

  const sendMessageToStaff = (tableId: number, message: string, type: string = 'info') => {
    if (socket && connected) {
      console.log(`💬 Sending message to staff from table ${tableId}:`, message);
      socket.emit('customer_message_to_staff', { tableId, message, type });
    }
  };

  const clearNotifications = () => {
    setOrderUpdates([]);
    setBillUpdates([]);
    setStaffMessages([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinTable,
        leaveTable,
        sendMessageToStaff,
        orderUpdates,
        billUpdates,
        staffMessages,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};