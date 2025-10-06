import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { apiService, convertBackendMenuItemToFrontend } from '../services/api';
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
  foodtype?: string;
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
  loading: boolean;
  error: string | null;
}

// Action Types
type AppAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TABLE_INFO'; payload: TableInfo }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] };

// Image mapping for menu items
const getImageForMenuItem = (id: number, name: string): string => {
  // Create a mapping based on item name or ID - updated to match backend English names
  const imageMap: { [key: string]: string } = {
    // RICE Category
    'Thai Basil Pork Rice': fish,
    'Green Curry Rice': karee,
    'Massaman Curry Rice': mhookrob,
    'Crispy Pork Rice': porkegg,
    'Rare Fish Rice Bowl': rarefish,

    // NOODLE Category
    'Pad Thai': noodle,
    'Tom Yum Noodle Soup': hotnoodle,
    'Red Pork Noodles': mhoodang,
    'Clear Beef Noodle Soup': noodle,

    // DRINK Category
    'Thai Iced Tea': thaitee,
    'Fresh Coconut Water': freshcoco,
    'Mango Smoothie': mangopun,
    'Lemon Iced Tea': lengzaab,

    // DESSERT Category
    'Mango Sticky Rice': mangosticky,
    'Tub Tim Grob': tubtim,
    'Strawberry Bingsu': bingsu,
    'Thai Coconut Ice Cream': freshcoco,

    // Legacy mappings for backward compatibility
    'Tom Yum Noodles': hotnoodle,
    'Curry Rice': karee,
    'Massaman Curry': mhookrob,
    'Thai Basil Stir Fry': fish,
    'Coconut Water': freshcoco,
    'Tom Yum Soup': hotnoodle,
    'Green Curry': karee,
    'Som Tam': lengzaab,
    'Spring Rolls': porkegg,
    'Coconut Soup': freshcoco,

    // Keep Thai names for backwards compatibility (if any are still used)
    'ข้าวหน้าปลาดิบ': rarefish,
    'ข้าวหน้าหมูไข่ดอง': porkegg,
    'ข้าวหน้าปลาไหล': fish,
    'ข้าวพร้อมเล้งแซ่บ': lengzaab,
    'ข้าวหน้าแกงกะหรี่': karee,
    'ข้าวหมูกรอบพริกเกลือ': mhookrob,
    'ก๋วยเตี๋ยวเนื้อน้ำใส': noodle,
    'ก๋วยเตี๋ยวหมูแดง': mhoodang,
    'ก๋วยเตี๋ยวต้มยำ': hotnoodle,
    'ชาไทยเย็น': thaitee,
    'น้ำมะพร้าวสด': freshcoco,
    'น้ำปั่นมะม่วง': mangopun,
    'ข้าวเหนียวมะม่วง': mangosticky,
    'ทับทิมกรอบ': tubtim,
    'บิงซูรสสตอเบอร์รี่': bingsu,
  };

  return imageMap[name] || rarefish; // Use rarefish as default image
};

// Initial State
const initialState: AppState = {
  cart: [],
  tableInfo: {
    number: "A-12",
    restaurant: "ครัวคุณยาย",
    capacity: 4,
    shareUrl: `${window.location.origin}/scan/table-A12-token-abc123`
  },
  menuItems: [],
  loading: false,
  error: null
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

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'SET_MENU_ITEMS':
      return {
        ...state,
        menuItems: action.payload
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

  // Fetch menu items from backend on mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const backendMenuItems = await apiService.getMenuItems(true);

        // Convert backend items to frontend format with images
        const frontendMenuItems: MenuItem[] = backendMenuItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: getImageForMenuItem(item.id, item.name),
          foodtype: item.foodtype
        }));

        dispatch({ type: 'SET_MENU_ITEMS', payload: frontendMenuItems });
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load menu items. Please check if the backend server is running.' });

        // Fallback to comprehensive sample data if backend is not available
        const fallbackMenuItems: MenuItem[] = [
          // RICE Category
          {
            id: 1,
            name: 'Thai Basil Pork Rice',
            description: 'Stir-fried pork with Thai basil served over jasmine rice',
            price: 89,
            image: fish,
            foodtype: 'RICE'
          },
          {
            id: 2,
            name: 'Green Curry Rice',
            description: 'Traditional Thai green curry with chicken and jasmine rice',
            price: 95,
            image: karee,
            foodtype: 'RICE'
          },
          {
            id: 3,
            name: 'Massaman Curry Rice',
            description: 'Rich and creamy massaman curry with beef and rice',
            price: 105,
            image: mhookrob,
            foodtype: 'RICE'
          },
          {
            id: 4,
            name: 'Crispy Pork Rice',
            description: 'Crispy pork belly with chili salt over steamed rice',
            price: 85,
            image: porkegg,
            foodtype: 'RICE'
          },
          {
            id: 5,
            name: 'Rare Fish Rice Bowl',
            description: 'Fresh sashimi-style fish over seasoned rice',
            price: 120,
            image: rarefish,
            foodtype: 'RICE'
          },

          // NOODLE Category
          {
            id: 6,
            name: 'Pad Thai',
            description: 'Traditional Thai stir-fried rice noodles with shrimp',
            price: 75,
            image: noodle,
            foodtype: 'NOODLE'
          },
          {
            id: 7,
            name: 'Tom Yum Noodle Soup',
            description: 'Spicy and sour noodle soup with pork and shrimp',
            price: 65,
            image: hotnoodle,
            foodtype: 'NOODLE'
          },
          {
            id: 8,
            name: 'Red Pork Noodles',
            description: 'Chinese-style noodles with BBQ red pork',
            price: 70,
            image: mhoodang,
            foodtype: 'NOODLE'
          },
          {
            id: 9,
            name: 'Clear Beef Noodle Soup',
            description: 'Light and clear beef noodle soup with herbs',
            price: 80,
            image: noodle,
            foodtype: 'NOODLE'
          },

          // DRINK Category
          {
            id: 10,
            name: 'Thai Iced Tea',
            description: 'Traditional Thai iced tea with condensed milk',
            price: 35,
            image: thaitee,
            foodtype: 'DRINK'
          },
          {
            id: 11,
            name: 'Fresh Coconut Water',
            description: 'Young coconut water served fresh from the shell',
            price: 40,
            image: freshcoco,
            foodtype: 'DRINK'
          },
          {
            id: 12,
            name: 'Mango Smoothie',
            description: 'Fresh mango blended with ice and milk',
            price: 50,
            image: mangopun,
            foodtype: 'DRINK'
          },
          {
            id: 13,
            name: 'Lemon Iced Tea',
            description: 'Refreshing iced tea with fresh lemon and mint',
            price: 30,
            image: lengzaab,
            foodtype: 'DRINK'
          },

          // DESSERT Category
          {
            id: 14,
            name: 'Mango Sticky Rice',
            description: 'Sweet coconut sticky rice with fresh mango slices',
            price: 55,
            image: mangosticky,
            foodtype: 'DESSERT'
          },
          {
            id: 15,
            name: 'Tub Tim Grob',
            description: 'Water chestnuts in coconut milk with crushed ice',
            price: 45,
            image: tubtim,
            foodtype: 'DESSERT'
          },
          {
            id: 16,
            name: 'Strawberry Bingsu',
            description: 'Korean-style shaved ice with strawberry and condensed milk',
            price: 65,
            image: bingsu,
            foodtype: 'DESSERT'
          },
          {
            id: 17,
            name: 'Thai Coconut Ice Cream',
            description: 'Homemade coconut ice cream with toppings',
            price: 40,
            image: freshcoco,
            foodtype: 'DESSERT'
          }
        ];
        dispatch({ type: 'SET_MENU_ITEMS', payload: fallbackMenuItems });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchMenuItems();
  }, []);

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