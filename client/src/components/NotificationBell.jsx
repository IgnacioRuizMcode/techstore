import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;