import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    }
  }, [user]);

  // Cargar el contador al iniciar sesión y cada 60 segundos
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Función para marcar como leído y actualizar el contador inmediatamente
  const markAsRead = useCallback(async (ids) => {
    try {
      await api.patch('/notifications/read', { ids });
      // Actualizar el contador restando los ids marcados
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    } catch (err) {
      console.error('Error al marcar como leído:', err);
    }
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, markAsRead, resetUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};