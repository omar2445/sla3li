import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const s = localStorage.getItem('sla3li_cart');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => {
    localStorage.setItem('sla3li_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product_id: product.id, name: product.name, name_ar: product.name_ar, price: product.price, unit: product.unit, wholesaler_id: product.wholesaler_id, wholesaler_name: product.wholesaler_name || product.business_name, min_order_qty: product.min_order_qty, quantity }];
    });
    toast.success('Added to cart');
  };

  const removeFromCart = (product_id) => setCart(prev => prev.filter(i => i.product_id !== product_id));

  const updateQty = (product_id, qty) => {
    if (qty < 1) return removeFromCart(product_id);
    setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
