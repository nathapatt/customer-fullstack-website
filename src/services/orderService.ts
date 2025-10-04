import { apiService } from './api';
import type { CartItem } from '../context/AppContext';

export interface OrderSubmissionData {
  tableId?: number;
  sessionId?: string;
  items: CartItem[];
}

export class OrderService {
  // Convert cart items to backend format
  private convertCartItemsToBackendFormat(cartItems: CartItem[]) {
    return cartItems.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      note: item.note || undefined // Use undefined instead of null for optional fields
    }));
  }

  // Submit order to backend
  async submitOrder(orderData: OrderSubmissionData) {
    try {
      // Default table ID if not provided (you can get this from URL params or QR scan)
      const tableId = orderData.tableId || 1; // Default to table 1 for now

      const backendOrderData = {
        tableId,
        sessionId: orderData.sessionId,
        items: this.convertCartItemsToBackendFormat(orderData.items)
      };

      const result = await apiService.createOrder(backendOrderData);

      return {
        success: true,
        orderId: result.id,
        order: result
      };
    } catch (error) {
      console.error('Failed to submit order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit order'
      };
    }
  }

  // Get order history for a session
  async getOrderHistory(sessionId: string) {
    try {
      const orders = await apiService.getSessionOrders(sessionId);
      return {
        success: true,
        orders
      };
    } catch (error) {
      console.error('Failed to get order history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order history'
      };
    }
  }

  // Get order queue (for kitchen/staff)
  async getOrderQueue() {
    try {
      const orders = await apiService.getOrderQueue();
      return {
        success: true,
        orders
      };
    } catch (error) {
      console.error('Failed to get order queue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order queue'
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId: number, status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED') {
    try {
      const order = await apiService.updateOrderStatus(orderId, status);
      return {
        success: true,
        order
      };
    } catch (error) {
      console.error('Failed to update order status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status'
      };
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();