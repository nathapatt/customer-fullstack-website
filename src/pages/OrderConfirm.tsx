import { useState } from 'react';
import { ChevronLeft, X, Plus, Minus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';
import { useSession } from '../context/SessionContext';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateCartItem, removeFromCart, clearCart } = useCart();
  const { sessionId, sessionData } = useSession();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const updateQuantity = (itemId: number, change: number) => {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      updateCartItem(itemId, item.quantity + change);
    }
  };

  const removeItem = (itemId: number) => {
    removeFromCart(itemId);
  };

  const handleCloseConfirmModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowConfirmModal(false);
      setIsClosingModal(false);
    }, 200);
  };

  const handleConfirmOrder = async () => {
    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      const result = await orderService.submitOrder({
        tableId: sessionData?.tableId || 1, // Use tableId from session
        sessionId: sessionId || undefined, // Use current session ID
        items: cart
      });

      if (result.success) {
        setIsClosingModal(true);
        setTimeout(() => {
          setShowConfirmModal(false);
          setIsClosingModal(false);
          setOrderConfirmed(true);
          // Show success message and redirect
          setTimeout(() => {
            clearCart();
            navigate('/');
          }, 3000);
        }, 200);
      } else {
        setOrderError(result.error || 'Failed to submit order');
      }
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">รายการทั้งหมด</h1>
        </div>
      </div>

      {/* Cart Items */}
      <div className="bg-white">
        <div className="divide-y divide-gray-100">
          {cart.map(item => (
            <div key={item.id} className="px-4 py-4">
              <div className="flex gap-4">
                {/* Food Image */}
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {item.note && (
                    <p className="text-sm text-gray-600 mb-2">• {item.note}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">฿ {item.price}</span>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 min-w-[1.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-cyan-500 hover:text-cyan-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-900">{cartCount} รายการ</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">฿ {cartTotal}</span>
            <Info className="w-5 h-5 text-cyan-500" />
          </div>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold transition-colors"
          disabled={cart.length === 0}
        >
          สั่ง {cartCount} รายการ
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className={`fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-[9999] ${
            isClosingModal ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={handleCloseConfirmModal}
        >
          <div
            className={`bg-white rounded-3xl p-6 w-full max-w-sm relative transform transition-all duration-300 shadow-2xl border border-gray-100 ${
              isClosingModal
                ? 'animate-slideDown scale-95 opacity-0'
                : 'animate-slideUp scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg transform rotate-12"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 bg-white border-2 border-orange-500 rounded-lg">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-3 h-0.5 bg-orange-500 mb-0.5"></div>
                      <div className="w-2 h-0.5 bg-orange-500 mb-0.5"></div>
                      <div className="w-3 h-0.5 bg-orange-500"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการสั่งอาหาร</h2>
              <p className="text-gray-600 text-sm mb-6">
                คุณต้องการยืนยันการสั่งอาหารหรือไม่
              </p>

              {/* Error Message */}
              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{orderError}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleCloseConfirmModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isSubmittingOrder ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>กำลังส่ง...</span>
                    </div>
                  ) : (
                    'ยืนยัน'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {orderConfirmed && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm relative transform animate-slideUp shadow-2xl border border-gray-100">
            <div className="text-center">
              {/* Animated Check Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">สั่งอาหารสำเร็จ!</h2>
              <p className="text-gray-600 mb-2">ออเดอร์ของคุณได้ส่งไปยังครัวแล้ว</p>
              <p className="text-gray-500 text-sm">กรุณารอสักครู่</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmationPage;