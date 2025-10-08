import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext, getImageForMenuItem } from '../context/AppContext';
import { useCart } from '../hooks/useCart';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  

  // Scroll to top immediately when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' }); // Instant scroll to top
  }, []);

  // ข้อมูลอาหาร
  const foodItem = state.menuItems.find(item => item.id === parseInt(id || '1'));

  if (!foodItem) {
    return <div>ไม่พบรายการอาหาร</div>;
  }


  const totalPrice = foodItem.price * quantity;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen animate-slideUpFromBottom">
      {/* Header Image */}
      <div className="relative">
        <img
          src={foodItem.image}
          alt={foodItem.name}
          className="w-full h-64 object-cover"
          onError={(e) => {
            // Fallback to local image if Cloudinary URL fails
            const target = e.target as HTMLImageElement;
            if (target.src !== getImageForMenuItem(foodItem.id, foodItem.name)) {
              target.src = getImageForMenuItem(foodItem.id, foodItem.name);
            }
          }}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Food Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {foodItem.name}
          </h1>
          <p className="text-base text-gray-600 mb-2">
            {foodItem.description}
          </p>
          <p className="text-lg font-bold text-gray-900">฿ {foodItem.price}</p>
        </div>

        {/* Note Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            หมายเหตุถึงร้านอาหาร
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ระบุรายละเอียดคำขอ (ขึ้นอยู่กับดุลยพินิจของร้าน)"
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {/* Quantity & Add to Cart */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-900">จำนวน</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              ฿ {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => {
            const cartItem = {
              ...foodItem,
              quantity,
              note
            };
            addToCart(cartItem);
            navigate('/');
          }}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors shadow-sm"
        >
          เพิ่มใส่ตะกร้า
        </button>
      </div>
    </div>
  );
};

export default FoodDetailPage;
