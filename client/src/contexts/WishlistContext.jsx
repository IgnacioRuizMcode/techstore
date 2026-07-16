import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar favoritos una sola vez al montar
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Error al cargar wishlist:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Verificar si un producto está en favoritos
  const isWishlisted = useCallback(
    (productId) => {
      return items.some(item => item.product?._id === productId);
    },
    [items]
  );

  // Toggle (agregar/quitar) un producto
  const toggleWishlist = useCallback(
    async (productId) => {
      try {
        const res = await api.post('/wishlist/toggle', { productId });
        if (res.data.action === 'added') {
          // Agregar optimistamente (o recargar)
          fetchWishlist(); // recargar para asegurar consistencia
        } else {
          // Quitar
          setItems(prev => prev.filter(item => item.product?._id !== productId));
        }
        return res.data.action;
      } catch (err) {
        console.error('Error al alternar wishlist:', err);
        throw err;
      }
    },
    [fetchWishlist]
  );

  // Eliminar un producto directamente
  const removeFromWishlist = useCallback(
    async (productId) => {
      try {
        await api.delete(`/wishlist/${productId}`);
        setItems(prev => prev.filter(item => item.product?._id !== productId));
      } catch (err) {
        console.error('Error al eliminar de wishlist:', err);
      }
    },
    []
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};