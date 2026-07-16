import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead, resetUnreadCount } = useNotifications();

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
      resetUnreadCount();
    }
  }, [notifications, markAsRead, resetUnreadCount]);

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length === 0) return;
    await markAsRead(unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Notificaciones</h2>
        {notifications.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <Link
              to={notif.link || '/notifications'}
              key={notif._id}
              className={`block p-4 rounded-xl border transition-colors hover:bg-muted/50 ${
                !notif.read ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{notif.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.createdAt).toLocaleString('es-CL')}
                  </p>
                </div>
                {!notif.read && (
                  <Badge variant="default" className="shrink-0 mt-1 bg-primary text-primary-foreground text-xs">
                    Nueva
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;