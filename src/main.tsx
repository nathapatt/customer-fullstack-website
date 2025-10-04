import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.tsx'
import { SessionProvider } from './context/SessionContext.tsx'
import './index.css'
import MenuPage from './pages/MenuPage.tsx'
import FoodDetailPage from './pages/Details.tsx'
import OrderConfirmationPage from './pages/OrderConfirm.tsx'
import QRScanPage from './pages/QRScanPage.tsx'
import SessionRequired from './pages/SessionRequired.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminQRGenerator from './pages/AdminQRGenerator.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/scan/:token" element={<QRScanPage />} />
            <Route path="/session-required" element={<SessionRequired />} />
            <Route path="/admin/qr" element={<AdminQRGenerator />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            } />
            <Route path="/food/:id" element={
              <ProtectedRoute>
                <FoodDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </SessionProvider>
  </StrictMode>,
)
