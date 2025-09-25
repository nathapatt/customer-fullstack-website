import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import rarefish from '../assets/foods/rarefish.jpg';
import noodle from '../assets/foods/noodle.jpg';
import mangosticky from '../assets/foods/mangosticky.jpg';
import thaitee from '../assets/foods/thaitee.jpg';
import mangopun from '../assets/foods/mangopun.jpg';
import freshcoco from '../assets/foods/freshcoco.jpg';
import tubtim from '../assets/foods/tubtim.jpg';
import hotnoodle from '../assets/foods/hotnoodle.jpg';
import bingsu from '../assets/foods/bingsu.jpg';
import porkegg from '../assets/foods/porkegg.jpg';
import lengzaab from '../assets/foods/lengzaab.jpg';
import fish from '../assets/foods/fish.jpg';
import karee from '../assets/foods/karee.jpg';
import mhookrob from '../assets/foods/mhookrob.jpg';
import mhoodang from '../assets/foods/mhoodang.jpg';

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
      description: 'ราดด้วยปลาหลากชนิดและไข่แซลมอน',
      price: 120,
      image: rarefish
    },
    {
      id: 2,
      name: 'ข้าวหน้าหมูไข่ดอง',
      description: 'ข้าวหน้าหมูราดด้วยไข่ดองซีอิ๊ว',
      price: 110,
      image: porkegg
    },
    {
      id: 3,
      name: 'ข้าวหน้าปลาไหล',
      description: 'ราดด้วยซอสหวาน คัดสันปลาไหลคุณภาพ',
      price: 149,
      image: fish
    },
    {
      id: 4,
      name: 'ข้าวพร้อมเล้งแซ่บ',
      description: 'ซุปเล้งรสแซ่บ พร้อมข้าวสวยร้อนๆ',
      price: 110,
      image: lengzaab
    },
    {
      id: 5,
      name: 'ข้าวหน้าแกงกะหรี่',
      description: 'ราดด้วยแกงกะหรี่ญี่ปุ่นเข้มข้น',
      price: 120,
      image: karee
    },
    {
      id: 6,
      name: 'ข้าวหมูกรอบพริกเกลือ',
      description: 'ราดด้วยซอสปลาและเครื่องเคียม',
      price: 120,
      image: mhookrob
    },
    // ก๋วยเตี๋ยว
    {
      id: 7,
      name: 'ก๋วยเตี๋ยวเนื้อน้ำใส',
      description: 'เส้นเล็กน้ำใสใส่เนื้อและลูกชิ้นเนื้อ',
      price: 45,
      image: noodle
    },
    {
      id: 8,
      name: 'ก๋วยเตี๋ยวหมูแดง',
      description: 'หมูแดงนุ่มๆ ราดด้วยน้ำซุปสูตรพิเศษ',
      price: 50,
      image: mhoodang
    },
    {
      id: 9,
      name: 'ก๋วยเตี๋ยวต้มยำ',
      description: 'เส้นเล็กน้ำต้มยำหมูสับและหมูนุ่มพร้อมไข่ออนเซน',
      price: 65,
      image: hotnoodle
    },
    // น้ำ
    {
      id: 10,
      name: 'ชาไทยเย็น',
      description: 'ชาไทยเข้มข้น หวานมัน ไม่ผสมสี',
      price: 25,
      image: thaitee
    },
    {
      id: 11,
      name: 'น้ำมะพร้าวสด',
      description: 'น้ำมะพร้าวสดจากลูกมะพร้าวอ่อน',
      price: 20,
      image: freshcoco
    },
    {
      id: 12,
      name: 'น้ำปั่นมะม่วง',
      description: 'น้ำปั่นมะม่วงสุกหวานเข้มข้น',
      price: 35,
      image: mangopun
    },
    // ของหวาน
    {
      id: 13,
      name: 'ข้าวเหนียวมะม่วง',
      description: 'ข้าวเหนียวหวานใส่มะม่วงสุกหวาน',
      price: 60,
      image: mangosticky
    },
    {
      id: 14,
      name: 'ทับทิมกรอบ',
      description: 'ทับทิมกรอบใส่กะทิและน้ำแข็งไส',
      price: 40,
      image: tubtim
    },
    {
      id: 15,
      name: 'บิงซูรสสตอเบอร์รี่',
      description: 'บิงซูเกล็ดหิมะรสนมใส่สตอเบอร์รี่และนมข้นหวาน',
      price: 80,
      image: bingsu
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