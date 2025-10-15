// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_PROXY_PATH || "/api";

// Types matching backend schema
export interface BackendMenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  foodtype: string | null;
  isAvailable: boolean;
  photoUrl?: string | null;
  photoId?: string | null;
}

export interface BackendOrder {
  id: number;
  tableId: number;
  sessionId: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  queuePos: number | null;
  orderItems: BackendOrderItem[];
}

export interface BackendOrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  note: string | null;
  menuItem: BackendMenuItem;
}

export interface BackendTable {
  id: number;
  tableNumber: number;
  status: string | null;
  capacity: number;
  qrCodeToken: string;
}

export interface BackendSession {
  id: string;
  tableId: number;
  createdAt: string;
  expiresAt: string | null;
  metaJson: any;
  message?: string;
}

// API Service Class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Menu API methods
  async getMenuItems(onlyAvailable = true): Promise<BackendMenuItem[]> {
    return this.request<BackendMenuItem[]>(
      `/menu?onlyAvailable=${onlyAvailable}`
    );
  }

  async getMenuItem(id: number): Promise<BackendMenuItem> {
    return this.request<BackendMenuItem>(`/menu/${id}`);
  }

  // Orders API methods
  async createOrder(orderData: {
    tableId: number;
    sessionId?: string;
    items: Array<{
      menuItemId: number;
      quantity: number;
      note?: string;
    }>;
  }): Promise<BackendOrder> {
    return this.request<BackendOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: number): Promise<BackendOrder> {
    return this.request<BackendOrder>(`/orders/${id}`);
  }

  async getOrderQueue(): Promise<BackendOrder[]> {
    return this.request<BackendOrder[]>("/orders/queue");
  }

  async updateOrderStatus(
    id: number,
    status: "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED"
  ): Promise<BackendOrder> {
    return this.request<BackendOrder>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Tables API methods
  async getTables(): Promise<BackendTable[]> {
    return this.request<BackendTable[]>("/tables");
  }

  async getTable(id: number): Promise<BackendTable> {
    return this.request<BackendTable>(`/tables/${id}`);
  }

  async createTable(tableData: {
    tableNumber: number;
    capacity?: number;
  }): Promise<BackendTable> {
    return this.request<BackendTable>("/tables", {
      method: "POST",
      body: JSON.stringify(tableData),
    });
  }

  async updateTableStatus(id: number, status: string): Promise<BackendTable> {
    return this.request<BackendTable>(`/tables/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Sessions API methods
  async createSession(
    qrCodeToken: string,
    meta?: any
  ): Promise<BackendSession> {
    return this.request<BackendSession>("/sessions", {
      method: "POST",
      body: JSON.stringify({ qrCodeToken, meta }),
    });
  }

  async getSessionOrders(sessionId: string): Promise<BackendOrder[]> {
    return this.request<BackendOrder[]>(`/sessions/${sessionId}/orders`);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Helper functions to convert backend data to frontend format
export const convertBackendMenuItemToFrontend = (
  backendItem: BackendMenuItem
) => ({
  id: backendItem.id,
  name: backendItem.name,
  description: backendItem.description || "",
  price: backendItem.price,
  image: `/api/menu/${backendItem.id}/image`, // You'll need to add image endpoint or use placeholder
});

export const convertFrontendOrderToBackend = (frontendOrder: {
  tableId: number;
  sessionId?: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
    note?: string;
  }>;
}) => ({
  tableId: frontendOrder.tableId,
  sessionId: frontendOrder.sessionId,
  orderItems: frontendOrder.items,
});
