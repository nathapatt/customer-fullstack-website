import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  selectedSauce?: string;
  selectedToppings?: { id: string; name: string; price: number; quantity: number }[];
  note?: string;
}

interface TableInfo {
  number: string;
  restaurant: string;
  capacity: number;
  shareUrl: string;
}

interface AppState {
  cart: CartItem[];
  tableInfo: TableInfo;
  menuItems: MenuItem[];
}

// Action Types
type AppAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TABLE_INFO'; payload: TableInfo };

// Initial State
const initialState: AppState = {
  cart: [],
  tableInfo: {
    number: "A-12",
    restaurant: "ครัวคุณยาย",
    capacity: 4,
    shareUrl: "https://restaurant.com/table/A12"
  },
  menuItems: [
    {
      id: 1,
      name: 'ข้าวหน้าปลาดิบ',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 120,
      image: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=300'
    },
    {
      id: 2,
      name: 'ข้าวหน้าไข่ดองเนบ',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 110,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300'
    },
    {
      id: 3,
      name: 'ข้าวหน้าปลาไหล จากเกาะออกไดโด หนึ่งด้วยบริมลิก',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 149,
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300'
    },
    {
      id: 4,
      name: 'ข้าวหน้าว่าฟัว',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 110,
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300'
    },
    {
      id: 5,
      name: 'ข้าวหน้าแกงปะ',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 120,
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300'
    },
    {
      id: 6,
      name: 'ข้าวหน้าใส่ลิง',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 120,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300'
    },
    // ก๋วยเตี๋ยว
    {
      id: 7,
      name: 'ก๋วยเตี๋ยวเนื้อน้ำใส',
      description: 'เส้นเล็กน้ำใสใส่เนื้อและลูกชิ้นเนื้อ',
      price: 45,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300'
    },
    {
      id: 8,
      name: 'ก๋วยเตี๋ยวหมูแดงน้ำแดง',
      description: 'เส้นใหญ่น้ำแดงใส่หมูแดงและเครื่องในหมู',
      price: 50,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300'
    },
    {
      id: 9,
      name: 'ก๋วยเตี๋ยวต้มยำกุ้ง',
      description: 'เส้นเล็กน้ำต้มยำใส่กุ้งและเห็ด',
      price: 65,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300'
    },
    // น้ำ
    {
      id: 10,
      name: 'น้ำส้มคั้นสด',
      description: 'น้ำส้มคั้นสดใหม่ 100%',
      price: 25,
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300'
    },
    {
      id: 11,
      name: 'น้ำมะพร้าวสด',
      description: 'น้ำมะพร้าวสดจากลูกมะพร้าวอ่อน',
      price: 20,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'
    },
    {
      id: 12,
      name: 'น้ำปั่นมะม่วง',
      description: 'น้ำปั่นมะม่วงสุกหวานเข้มข้น',
      price: 35,
      image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300'
    },
    // ของหวาน
    {
      id: 13,
      name: 'ข้าวเหนียวมะม่วง',
      description: 'ข้าวเหนียวหวานใส่มะม่วงสุกหวาน',
      price: 60,
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300'
    },
    {
      id: 14,
      name: 'ทับทิมกรอบ',
      description: 'ทับทิมกรอบใส่กะทิและน้ำแข็งไส',
      price: 40,
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300'
    },
    {
      id: 15,
      name: 'โรตีกล้วยหอม',
      description: 'โรตีกรอบใส่กล้วยหอมและนมข้นหวาน',
      price: 35,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'
    }
  ]
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      { const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, action.payload]
      }; }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };

    case 'SET_TABLE_INFO':
      return {
        ...state,
        tableInfo: action.payload
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Export types for use in other components
export type { MenuItem, CartItem, TableInfo };