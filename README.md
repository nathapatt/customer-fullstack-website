# 🍽️ Thai Restaurant QR Order System

A modern, mobile-first restaurant ordering system built with React, TypeScript, and Tailwind CSS. Customers can scan QR codes at tables to browse menus, place orders, and track their dining experience.

## ✨ Features

### 🏠 **Menu Browsing**
- **Category-based navigation** with smooth scrolling tabs (เมนูขายดี, ข้าว, ก๋วยเตี๋ยว, น้ำ, ของหวาน)
- **Real-time search** with instant filtering
- **Smart category detection** - items automatically categorized by name
- **Popular menu section** featuring curated top 4 dishes
- **Responsive food cards** with images, descriptions, and pricing

### 🛒 **Shopping Cart**
- **Smart add-to-cart buttons** - shows + icon or quantity if item already in cart
- **Modal cart view** with slide-up animations
- **Cart persistence** across navigation
- **Real-time totals** and item counts
- **Quick access** via floating cart button

### 🎯 **Order Management**
- **Order confirmation** with detailed item breakdown
- **Quantity adjustment** with +/- controls
- **Item removal** with smooth animations
- **Order history tracking** accessible via bell icon
- **Status indicators** (กำลังทำ, เสร็จแล้ว) with color coding

### 🤝 **Social Features**
- **"สั่งกับเพื่อน"** - QR code sharing for group ordering
- **Table-based sessions** with unique table identifiers
- **Collaborative ordering** from same table

### 🎨 **User Experience**
- **Professional animations** - Ant Design-inspired modal transitions
- **Mobile-optimized** responsive design
- **Touch-friendly** interface with proper spacing
- **Loading states** and smooth transitions
- **Thai language** interface throughout

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom animations
- **Build Tool**: Vite with HMR
- **State Management**: React Context API + useReducer
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Images**: Unsplash integration

## 📱 Pages & Components

### **Core Pages**
- **`MenuPage`** - Main landing page with categorized menu
- **`FoodDetailPage`** - Item customization (sauce, toppings, notes)
- **`OrderConfirmationPage`** - Cart review and order placement

### **Key Components**
- **Modal System** - Reusable modals with consistent animations
- **Category Tabs** - Horizontal scrollable navigation
- **Search Bar** - Real-time filtering with empty states
- **Cart System** - Persistent cart with quantity management
- **Order History** - Track previous orders with status

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd customer-ordering-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── context/
│   └── AppContext.tsx  # Global state management
├── hooks/
│   └── useCart.ts      # Cart management logic
├── pages/
│   ├── MenuPage.tsx    # Main menu with categories
│   ├── Details.tsx     # Food customization
│   └── OrderConfirm.tsx # Order review
├── main.tsx            # App entry point with routing
└── index.css           # Custom animations + Tailwind
```

## 🎨 Design System

### **Colors**
- Primary: Cyan (`bg-cyan-500`)
- Success: Green (`bg-green-500`)
- Background: Gray (`bg-gray-50`)
- Cards: White (`bg-white`)

### **Typography**
- Headers: `font-bold` with varying sizes
- Body: `font-medium` for emphasis
- Descriptions: `text-gray-600` for secondary text

### **Animations**
- **Modal transitions**: `animate-fadeIn`, `animate-slideUp`
- **Bottom sheets**: `animate-slideUpFromBottom`
- **Interactive elements**: `hover:` states with transitions

## 📊 Menu Data

Sample menu includes:
- **6 Rice dishes** (ข้าว) - Traditional Thai rice bowls
- **3 Noodle soups** (ก๋วยเตี๋ยว) - Various broth styles
- **3 Beverages** (น้ำ) - Fresh juices and smoothies
- **3 Desserts** (ของหวาน) - Classic Thai sweets
- **4 Popular items** (เมนูขายดี) - Curated highlights

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### **Key Features to Extend**
- Payment integration
- Real-time order tracking
- Kitchen dashboard integration
- Multi-language support
- Offline capability

## 📄 License

This project is part of a university full-stack development course.

---

