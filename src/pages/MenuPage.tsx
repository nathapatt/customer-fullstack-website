import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ShoppingCart, Users, QrCode, X, Copy, Check, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext, getImageForMenuItem, type MenuItem } from '../context/AppContext';
import { useCart } from '../hooks/useCart';
import { useSession } from '../context/SessionContext';
import { useSocket } from '../contexts/SocketContext';
import { apiService, type BackendOrder } from '../services/api';
import QRCode from 'qrcode';

const MenuPage = () => {
  const { state, dispatch } = useAppContext();
  const { cart, cartCount, cartTotal, addToCart, updateCartItem } = useCart();
  const { sessionId, sessionData } = useSession();
  const { joinTable, connected } = useSocket();
  const [showCart, setShowCart] = useState(false);
  const [isClosingCart, setIsClosingCart] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('เมนูขายดี');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [isClosingOrderHistory, setIsClosingOrderHistory] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [orderHistory, setOrderHistory] = useState<BackendOrder[]>([]);
  const [loadingOrderHistory, setLoadingOrderHistory] = useState(false);

  // Refs for scrolling to sections
  const sectionRefs = {
    'เมนูขายดี': useRef<HTMLDivElement>(null),
    'ข้าว': useRef<HTMLDivElement>(null),
    'ก๋วยเตี๋ยว': useRef<HTMLDivElement>(null),
    'น้ำ': useRef<HTMLDivElement>(null),
    'ของหวาน': useRef<HTMLDivElement>(null)
  };

  const categories = ['เมนูขายดี', 'ข้าว', 'ก๋วยเตี๋ยว', 'น้ำ', 'ของหวาน'];

  const getCategoryForItem = (item: any) => {
    // Use foodtype from backend data if available
    if (item.foodtype) {
      switch (item.foodtype) {
        case 'RICE':
          return 'ข้าว';
        case 'NOODLE':
          return 'ก๋วยเตี๋ยว';
        case 'DRINK':
          return 'น้ำ';
        case 'DESSERT':
          return 'ของหวาน';
        // Legacy support for old names
        case 'Main Course':
          return 'ข้าว';
        case 'Noodle':
          return 'ก๋วยเตี๋ยว';
        case 'Beverage':
          return 'น้ำ';
        case 'Dessert':
          return 'ของหวาน';
        default:
          return 'เมนูขายดี';
      }
    }

    // Fallback to name-based categorization for backward compatibility
    const name = item.name.toLowerCase();
    if (name.includes('curry') || name.includes('stir fry') || name.includes('rice') || name.includes('ข้าว')) return 'ข้าว';
    if (name.includes('noodle') || name.includes('soup') || name.includes('ก๋วยเตี๋ยว')) return 'ก๋วยเตี๋ยว';
    if (name.includes('tea') || name.includes('drink') || name.includes('beverage') || name.includes('water') || name.includes('น้ำ')) return 'น้ำ';
    if (name.includes('mango') || name.includes('dessert') || name.includes('sweet') || name.includes('ice cream') || name.includes('ของหวาน')) return 'ของหวาน';

    return 'เมนูขายดี';
  };

  const getItemQuantityInCart = (itemId: number) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filteredMenuItems = searchQuery
    ? state.menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : state.menuItems; // Show all items when not searching

  // Popular menu items (one from each category)
  const popularItemIds = [1, 6, 10, 14]; // Thai Basil Pork Rice, Pad Thai, Thai Iced Tea, Mango Sticky Rice

  // Group items by category
  const groupedMenuItems = categories.reduce((acc, category) => {
    let categoryItems;
    if (category === 'เมนูขายดี') {
      // Popular menu shows only 4 specific items
      categoryItems = filteredMenuItems.filter(item => popularItemIds.includes(item.id));
    } else {
      // Other categories show items that belong to their category
      categoryItems = filteredMenuItems.filter(item => getCategoryForItem(item) === category);
    }
    if (categoryItems.length > 0) {
      acc[category] = categoryItems;
    }
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Load order history when session ID changes or when opening order history
  const loadOrderHistory = async () => {
    if (!sessionId) return;

    setLoadingOrderHistory(true);
    try {
      const orders = await apiService.getSessionOrders(sessionId);
      setOrderHistory(orders);
    } catch (error) {
      console.error('Failed to load order history:', error);
      setOrderHistory([]);
    } finally {
      setLoadingOrderHistory(false);
    }
  };

  // Load order history when component mounts or session changes
  useEffect(() => {
    if (sessionId) {
      loadOrderHistory();
    }
  }, [sessionId]);

  // Join table room for real-time updates
  useEffect(() => {
    if (sessionData?.tableId && sessionId) {
      console.log('Joining table room:', sessionData.tableId, 'with session:', sessionId);
      joinTable(sessionData.tableId, sessionId);
    }
  }, [sessionData?.tableId, sessionId, joinTable]);

  // Listen for real-time order status updates
  useEffect(() => {
    const handleOrderCreated = (event: CustomEvent) => {
      console.log('🆕 New order created:', event.detail);
      // Reload order history to show the new order
      if (sessionId) {
        loadOrderHistory();
      }
    };

    const handleOrderStatusUpdated = (event: CustomEvent) => {
      console.log('📋 Order status updated:', event.detail);
      const updatedOrderData = event.detail;

      // Update the specific order in orderHistory state
      setOrderHistory(prev => prev.map(order => {
        if (order.id === updatedOrderData.orderId || order.id === updatedOrderData.id) {
          return {
            ...order,
            status: updatedOrderData.status
          };
        }
        return order;
      }));
    };

    // Add event listeners
    window.addEventListener('orderCreated', handleOrderCreated as EventListener);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdated as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated as EventListener);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdated as EventListener);
    };
  }, [sessionId]);

  // Generate QR Code for the table URL
  const generateQRCode = async (url: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 192,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataURL(qrDataURL);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  // Generate QR code when component mounts or table info changes
  useEffect(() => {
    if (state.tableInfo.shareUrl) {
      generateQRCode(state.tableInfo.shareUrl);
    }
  }, [state.tableInfo.shareUrl]);

  // Demo function to switch tables (for testing QR codes)
  const switchToTable = (tableNumber: string) => {
    const tableInfo = {
      number: tableNumber,
      restaurant: "ครัวคุณยาย",
      capacity: 4,
      shareUrl: `${window.location.origin}/scan/table-${tableNumber}-token-${Math.random().toString(36).substr(2, 9)}`
    };
    dispatch({ type: 'SET_TABLE_INFO', payload: tableInfo });
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(state.tableInfo.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowQRModal(false);
      setIsClosing(false);
    }, 200);
  };

  const handleCloseCart = () => {
    setIsClosingCart(true);
    setTimeout(() => {
      setShowCart(false);
      setIsClosingCart(false);
    }, 200);
  };

  const handleCloseOrderHistory = () => {
    setIsClosingOrderHistory(true);
    setTimeout(() => {
      setShowOrderHistory(false);
      setIsClosingOrderHistory(false);
    }, 200);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A7</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">โต๊ะ {state.tableInfo.number}</h1>
              <p className="text-sm text-gray-600">{state.tableInfo.restaurant}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 px-3 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">สั่งกับเพื่อน</span>
            </button>
            <button
              onClick={() => {
                setShowOrderHistory(true);
                loadOrderHistory(); // Refresh order history when opening
              }}
              className="relative"
            >
              <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
              {/* WebSocket connection indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาเมนู"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveTab(category);
                  // Scroll to section
                  const sectionRef = sectionRefs[category as keyof typeof sectionRefs];
                  if (sectionRef.current) {
                    sectionRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === category
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.loading && (
        <div className="px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">กำลังโหลดเมนู...</p>
        </div>
      )}

      {/* Error State */}
      {state.error && !state.loading && (
        <div className="px-4 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{state.error}</p>
            <p className="text-red-600 text-xs mt-2">กำลังใช้ข้อมูลตัวอย่าง</p>
          </div>
        </div>
      )}

      {/* Empty Search Message */}
      {searchQuery && filteredMenuItems.length === 0 && !state.loading && (
        <div className="px-4 py-16 text-center">
          <p className="text-gray-500 text-lg">ไม่พบรายการที่ท่านค้นหา</p>
        </div>
      )}

      {/* Menu Items - Grouped by Categories */}
      {!searchQuery && !state.loading ? (
        <div className="space-y-6">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category} ref={sectionRefs[category as keyof typeof sectionRefs]}>
              {/* Category Title */}
              <div className="px-4 py-4 bg-white border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
              </div>

              {/* Items in Category */}
              <div className="bg-white">
                <div className="divide-y divide-gray-100">
                  {items.map(item => (
                    <div key={item.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                      <Link to={`/food/${item.id}`} className="flex gap-4">
                        {/* Food Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback to local image if Cloudinary URL fails
                              const target = e.target as HTMLImageElement;
                              if (target.src !== getImageForMenuItem(item.id, item.name)) {
                                target.src = getImageForMenuItem(item.id, item.name);
                              }
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-gray-900">
                                ฿ {item.price}
                              </span>
                            </div>
                            {getItemQuantityInCart(item.id) > 0 ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const currentQty = getItemQuantityInCart(item.id);
                                    if (currentQty > 1) {
                                      updateCartItem(item.id, currentQty - 1);
                                    } else {
                                      updateCartItem(item.id, 0); // This will remove the item
                                    }
                                  }}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold min-w-[1rem] text-center">
                                  {getItemQuantityInCart(item.id)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const currentQty = getItemQuantityInCart(item.id);
                                    updateCartItem(item.id, currentQty + 1);
                                  }}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const cartItem = {
                                    ...item,
                                    quantity: 1,
                                    note: ''
                                  };
                                  addToCart(cartItem);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Search Results */
        filteredMenuItems.length > 0 && !state.loading && (
          <div className="bg-white">
            <div className="divide-y divide-gray-100">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                  <Link to={`/food/${item.id}`} className="flex gap-4">
                    {/* Food Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to local image if Cloudinary URL fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== getImageForMenuItem(item.id, item.name)) {
                            target.src = getImageForMenuItem(item.id, item.name);
                          }
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-gray-900">
                            ฿ {item.price}
                          </span>
                        </div>
                        {getItemQuantityInCart(item.id) > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const currentQty = getItemQuantityInCart(item.id);
                                if (currentQty > 1) {
                                  updateCartItem(item.id, currentQty - 1);
                                } else {
                                  updateCartItem(item.id, 0); // This will remove the item
                                }
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold min-w-[1rem] text-center">
                              {getItemQuantityInCart(item.id)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const currentQty = getItemQuantityInCart(item.id);
                                updateCartItem(item.id, currentQty + 1);
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const cartItem = {
                                ...item,
                                quantity: 1,
                                note: ''
                              };
                              addToCart(cartItem);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Floating Menu Button */}
      {cartCount > 0 ? (
         <div className="fixed bottom-18 z-20 animate-slideUpFromBottom" style={{ right: 'max(0.75rem, calc(50vw - 180px + 0.75rem))' }}>
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      ) : (
         <div className="fixed bottom-5 z-20" style={{ right: 'max(0.75rem, calc(50vw - 180px + 0.75rem))' }}>
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      )}

      {/* Bottom Cart Bar */}
      {cartCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-4 shadow-lg transition-all block rounded-t-2xl animate-slideUpFromBottom"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">รายการที่สั่งทั้งหมด</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">฿{cartTotal}</span>
              <span className="bg-white text-cyan-500 px-2 py-1 rounded-full text-sm font-bold">
                {cartCount}
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div
          className={`fixed inset-0 modal-backdrop z-[9999] flex items-end ${
            isClosingCart ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={handleCloseCart}
        >
          <div
            className={`bg-white w-full max-w-md mx-auto rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl ${
              isClosingCart
                ? 'animate-slideDownToBottom'
                : 'animate-slideUpFromBottom'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">รายการที่สั่ง</h3>
                <button
                  onClick={handleCloseCart}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">฿{item.price} x {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ฿{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>รวมทั้งหมด</span>
                      <span>฿{cartTotal}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">ยังไม่มีรายการอาหาร</p>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <Link
                  to="/cart"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
                >
                  สั่งอาหาร ({cartCount} รายการ)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Sharing Modal */}
      {showQRModal && (
        <div
          className={`fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-[9999] ${
            isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-3xl p-6 w-full max-w-sm relative transform transition-all duration-300 shadow-2xl border border-gray-100 ${
              isClosing
                ? 'animate-slideDown scale-95 opacity-0'
                : 'animate-slideUp scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center pt-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                สั่งร่วมกับเพื่อน
              </h3>
              <p className="text-gray-600 mb-4">
                ให้เพื่อนสแกนเพื่อสั่งร่วมกัน โต๊ะ {state.tableInfo.number}
              </p>

              {/* QR Code Display */}
              <div className="bg-gray-100 rounded-2xl p-8 mb-6">
                <div className="w-48 h-48 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                  {qrCodeDataURL ? (
                    <img
                      src={qrCodeDataURL}
                      alt={`QR Code for Table ${state.tableInfo.number}`}
                      className="w-44 h-44 rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-500 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                      <span className="text-sm">Generating QR Code...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share URL */}
              <div className="bg-gray-50 rounded-xl p-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1 truncate">
                    {state.tableInfo.shareUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">คัดลอกแล้ว!</p>
                )}
              </div>

              <p className="text-sm text-gray-500">
                QR Code นี้ใช้ได้สำหรับโต๊ะ {state.tableInfo.number} เท่านั้น
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrderHistory && (
        <div
          className={`fixed inset-0 modal-backdrop z-[9999] flex items-end ${
            isClosingOrderHistory ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={handleCloseOrderHistory}
        >
          <div
            className={`bg-white w-full max-w-md mx-auto rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl ${
              isClosingOrderHistory
                ? 'animate-slideDownToBottom'
                : 'animate-slideUpFromBottom'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">ประวัติการสั่งอาหาร</h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>{connected ? 'เชื่อมต่อแล้ว' : 'ขาดการเชื่อมต่อ'}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseOrderHistory}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingOrderHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">กำลังโหลดประวัติการสั่งอาหาร...</p>
                </div>
              ) : orderHistory.length > 0 ? (
                <div className="space-y-4">
                  {orderHistory.map(order => {
                    // Calculate total for this order
                    const orderTotal = order.orderItems.reduce((total, item) => {
                      return total + (item.menuItem.price * item.quantity);
                    }, 0);

                    // Convert status to Thai
                    const getStatusText = (status: string) => {
                      switch (status) {
                        case 'PENDING': return 'รอดำเนินการ';
                        case 'IN_PROGRESS': return 'กำลังทำ';
                        case 'DONE': return 'เสร็จแล้ว';
                        case 'CANCELLED': return 'ยกเลิก';
                        default: return status;
                      }
                    };

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'DONE': return 'bg-green-100 text-green-700';
                        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
                        case 'PENDING': return 'bg-orange-100 text-orange-700';
                        case 'CANCELLED': return 'bg-red-100 text-red-700';
                        default: return 'bg-gray-100 text-gray-700';
                      }
                    };

                    return (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              ออเดอร์ #{order.id}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>

                        <div className="space-y-2 mb-3">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div className="flex-1">
                                <span className="text-gray-700">
                                  {item.menuItem.name} x{item.quantity}
                                </span>
                                {item.note && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    หมายเหตุ: {item.note}
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-900 font-medium">
                                ฿{(item.menuItem.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>รวม</span>
                            <span>฿{orderTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">ยังไม่มีประวัติการสั่งอาหาร</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;