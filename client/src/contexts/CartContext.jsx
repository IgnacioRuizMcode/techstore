import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
    if (user) {
      api.get('/cart')
        .then(res => setCart(res.data.data))
        .catch(() => setCart({ items: [] }));
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const addToCart = useCallback(async (productId, variantId, quantity = 1) => {
    if (!user) return;
    try {
      const res = await api.post('/cart', { productId, variantId, quantity });
      setCart(res.data.data);
      alert(res.data.message || 'Producto agregado correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al agregar al carrito';
      alert(msg);
    }
  }, [user]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      setCart(res.data.data);
      if (res.data.message) alert(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar';
      alert(msg);
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCart(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [] });
    } catch (err) {
      console.error(err);
      setCart({ items: [] });
    }
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeItem, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};