// Cookie utilities for customer frontend
export const cookieUtils = {
  // Set a cookie
  setCookie: (name: string, value: string, days: number = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  },

  // Get a cookie value
  getCookie: (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  },

  // Delete a cookie
  deleteCookie: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  // Session-specific utilities
  session: {
    setSessionId: (sessionId: string) => {
      cookieUtils.setCookie('customer_session_id', sessionId, 1); // 1 day
    },

    getSessionId: (): string | null => {
      return cookieUtils.getCookie('customer_session_id');
    },

    clearSession: () => {
      cookieUtils.deleteCookie('customer_session_id');
    },

    setTableInfo: (tableId: number, tableNumber: number) => {
      const tableInfo = JSON.stringify({ tableId, tableNumber });
      cookieUtils.setCookie('customer_table_info', tableInfo, 1);
    },

    getTableInfo: (): { tableId: number; tableNumber: number } | null => {
      const tableInfo = cookieUtils.getCookie('customer_table_info');
      if (tableInfo) {
        try {
          return JSON.parse(tableInfo);
        } catch {
          return null;
        }
      }
      return null;
    },

    clearTableInfo: () => {
      cookieUtils.deleteCookie('customer_table_info');
    }
  }
};