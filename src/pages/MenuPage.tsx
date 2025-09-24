import { useState, useRef } from 'react';
import { Search, Bell, Menu, ShoppingCart, Users, QrCode, X, Copy, Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext, type MenuItem } from '../context/AppContext';
import { useCart } from '../hooks/useCart';

const MenuPage = () => {
  const { state } = useAppContext();
  const { cart, cartCount, cartTotal, addToCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [isClosingCart, setIsClosingCart] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('เมนูขายดี');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [isClosingOrderHistory, setIsClosingOrderHistory] = useState(false);

  // Refs for scrolling to sections
  const sectionRefs = {
    'เมนูขายดี': useRef<HTMLDivElement>(null),
    'ข้าว': useRef<HTMLDivElement>(null),
    'ก๋วยเตี๋ยว': useRef<HTMLDivElement>(null),
    'น้ำ': useRef<HTMLDivElement>(null),
    'ของหวาน': useRef<HTMLDivElement>(null)
  };

  const categories = ['เมนูขายดี', 'ข้าว', 'ก๋วยเตี๋ยว', 'น้ำ', 'ของหวาน'];

  const getCategoryForItem = (item: MenuItem) => {
    if (item.name.includes('ข้าว')) return 'ข้าว';
    if (item.name.includes('ก๋วยเตี๋ยว')) return 'ก๋วยเตี๋ยว';
    if (item.name.includes('น้ำ') || item.name.includes('เครื่องดื่ม')) return 'น้ำ';
    if (item.name.includes('ของหวาน') || item.name.includes('ข้าวเหนียว') ||
        item.name.includes('ทับทิม') || item.name.includes('โรตี')) return 'ของหวาน';
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

  // Popular menu items (specific 4 items)
  const popularItemIds = [1, 7, 10, 13]; // ข้าวหน้าปลาดิบ, ก๋วยเตี๋ยวเนื้อน้ำใส, น้ำส้มคั้นสด, ข้าวเหนียวมะม่วง

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

  // Sample order history data
  const orderHistory = [
    {
      id: 1,
      orderTime: '14:30',
      status: 'กำลังทำ',
      items: [
        { name: 'ข้าวหน้าปลาดิบ', quantity: 2, price: 120 },
        { name: 'ข้าวหน้าไข่ดองเนบ', quantity: 1, price: 110 }
      ],
      total: 350
    },
    {
      id: 2,
      orderTime: '13:45',
      status: 'เสร็จแล้ว',
      items: [
        { name: 'ข้าวหน้าว่าฟัว', quantity: 1, price: 110 }
      ],
      total: 110
    }
  ];

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
            <button onClick={() => setShowOrderHistory(true)}>
              <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
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

      {/* Empty Search Message */}
      {searchQuery && filteredMenuItems.length === 0 && (
        <div className="px-4 py-16 text-center">
          <p className="text-gray-500 text-lg">ไม่พบรายการที่ท่านค้นหา</p>
        </div>
      )}

      {/* Menu Items - Grouped by Categories */}
      {!searchQuery ? (
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
                            <Link
                              to={`/food/${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                              {getItemQuantityInCart(item.id) > 0 ? (
                                <span className="text-sm font-bold">{getItemQuantityInCart(item.id)}</span>
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Link>
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
        filteredMenuItems.length > 0 && (
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
                        <Link
                          to={`/food/${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        >
                          {getItemQuantityInCart(item.id) > 0 ? (
                            <span className="text-sm font-bold">{getItemQuantityInCart(item.id)}</span>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Link>
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
              <p className="text-gray-600 mb-6">
                ให้เพื่อนสแกนเพื่อสั่งร่วมกัน โต๊ะ {state.tableInfo.number}
              </p>

              {/* QR Code Display */}
              <div className="bg-gray-100 rounded-2xl p-8 mb-6">
                <div className="w-48 h-48 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                  {/* Mock QR Code */}
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${
                          Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
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
                <h3 className="text-lg font-semibold text-gray-900">ประวัติการสั่งอาหาร</h3>
                <button
                  onClick={handleCloseOrderHistory}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {orderHistory.length > 0 ? (
                <div className="space-y-4">
                  {orderHistory.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            ออเดอร์ #{order.id}
                          </span>
                          <span className="text-sm text-gray-500">{order.orderTime}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'เสร็จแล้ว'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="text-gray-900 font-medium">
                              ฿{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>รวม</span>
                          <span>฿{order.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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