import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'
import MenuPage from './pages/MenuPage.tsx'
import FoodDetailPage from './pages/Details.tsx'
import OrderConfirmationPage from './pages/OrderConfirm.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/cart" element={<OrderConfirmationPage />} />
        </Routes>
      </Router>
    </AppProvider>
  </StrictMode>,
)
