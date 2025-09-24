import { useAppContext, type CartItem } from '../context/AppContext';

export const useCart = () => {
  const { state, dispatch } = useAppContext();

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (itemId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateCartItem = (itemId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = state.cart.reduce((sum, item) => {
    const toppingsTotal = item.selectedToppings?.reduce(
      (tSum, topping) => tSum + (topping.price * topping.quantity),
      0
    ) || 0;
    return sum + ((item.price + toppingsTotal) * item.quantity);
  }, 0);

  const getCartItem = (itemId: number) => {
    return state.cart.find(item => item.id === itemId);
  };

  const isItemInCart = (itemId: number): boolean => {
    return state.cart.some(item => item.id === itemId);
  };

  return {
    cart: state.cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartItem,
    isItemInCart
  };
};