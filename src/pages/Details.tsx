import { useState, useEffect } from "react";
import { ChevronLeft, Heart, Plus, Minus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext, getImageForMenuItem } from '../context/AppContext';
import { useCart } from '../hooks/useCart';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSauce, setSelectedSauce] = useState("spicy");
  const [selectedToppings, setSelectedToppings] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Scroll to top immediately when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' }); // Instant scroll to top
  }, []);

  // ข้อมูลอาหาร
  const foodItem = state.menuItems.find(item => item.id === parseInt(id || '1'));

  if (!foodItem) {
    return <div>ไม่พบรายการอาหาร</div>;
  }

  // ตัวเลือกน้ำจิ้ม
  const sauceOptions = [
    { id: "spicy", name: "เผ็ด", selected: true },
    { id: "mild", name: "ไม่เผ็ด", selected: false },
  ];

  // ตัวเลือกเพิ่มเติม
  const toppingOptions = [
    { id: "nori", name: "โนริ", price: 0, maxQty: 5 },
    { id: "wasabi", name: "วาซาบิ", price: 0, maxQty: 3 },
  ];

  const handleToppingChange = (toppingId: string, change: number) => {
    setSelectedToppings((prev) => {
      const existing = prev.find((t) => t.id === toppingId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + change);
        if (newQty === 0) {
          return prev.filter((t) => t.id !== toppingId);
        }
        return prev.map((t) =>
          t.id === toppingId ? { ...t, quantity: newQty } : t
        );
      } else if (change > 0) {
        const topping = toppingOptions.find((t) => t.id === toppingId);
        return [...prev, { ...topping, quantity: 1 }];
      }
      return prev;
    });
  };

  const getToppingQuantity = (toppingId: string) => {
    const topping = selectedToppings.find((t) => t.id === toppingId);
    return topping ? topping.quantity : 0;
  };

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

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md"
        >
          <Heart
            className={`w-6 h-6 ${
              isFavorite ? "text-red-500 fill-current" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Food Info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {foodItem.name}
          </h1>
          <p className="text-2xl font-bold text-gray-900">฿ {foodItem.price}</p>
        </div>

        {/* Sauce Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">น้ำจิ้ม</h3>
          <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full mb-3">
            บังคับ
          </span>
          <div className="space-y-2">
            {sauceOptions.map((sauce) => (
              <label key={sauce.id} className="flex items-center">
                <input
                  type="radio"
                  name="sauce"
                  value={sauce.id}
                  checked={selectedSauce === sauce.id}
                  onChange={(e) => setSelectedSauce(e.target.value)}
                  className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                />
                <span className="ml-3 text-gray-700">{sauce.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Toppings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            เพิ่มเติม
          </h3>
          <span className="inline-block bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full mb-3">
            ตัวเลือก
          </span>
          <div className="space-y-4">
            {toppingOptions.map((topping) => {
              const quantity = getToppingQuantity(topping.id);
              return (
                <div
                  key={topping.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quantity > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleToppingChange(topping.id, 1);
                        } else {
                          setSelectedToppings((prev) =>
                            prev.filter((t) => t.id !== topping.id)
                          );
                        }
                      }}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <span className="ml-3 text-gray-700">
                      {topping.name} • ฿ {topping.price}
                    </span>
                  </div>

                  {quantity > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToppingChange(topping.id, -1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-6 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleToppingChange(topping.id, 1)}
                        disabled={quantity >= topping.maxQty}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Note Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ใส่ข้อความ
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="text-red-700 text-sm">แจ้งครัว</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ระบุความต้องการพิเศษ..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            เช่น ปรับความเผ็ด ไม่ใส่ผักชี หรือคำขอพิเศษอื่นๆ
          </p>
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
              selectedSauce,
              selectedToppings,
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
