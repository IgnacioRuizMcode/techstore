import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tag,
  BarChart3,
  Users,
  Zap,
  LogOut,
  Store,
  ChevronRight,
  Menu,
  X,
  Bell,
  Settings,
} from 'lucide-react';

const allNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'superadmin'] },
  { href: '/admin/products', icon: Package, label: 'Productos', roles: ['admin', 'superadmin'] },
  { href: '/admin/orders', icon: ClipboardList, label: 'Pedidos', roles: ['admin', 'superadmin'] },
  { href: '/admin/coupons', icon: Tag, label: 'Cupones', roles: ['admin', 'superadmin'] },
  { href: '/admin/stats', icon: BarChart3, label: 'Estadísticas', roles: ['admin', 'superadmin'] },
  { href: '/admin/users', icon: Users, label: 'Usuarios', roles: ['superadmin'] },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role));

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Cargar notificaciones del admin
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // cada 30s
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length > 0) {
      await api.patch('/notifications/read', { ids: unreadIds });
      fetchNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:flex lg:w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">
              Tech<span className="text-primary">Store</span>
            </span>
          </Link>
          <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <Store className="h-5 w-5" /> Volver a la tienda
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all mt-1">
            <LogOut className="h-5 w-5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border animate-slide-in-right">
            <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <Zap className="h-7 w-7 text-primary" />
                <span className="text-lg font-bold text-sidebar-foreground">
                  Tech<span className="text-primary">Store</span>
                </span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
                <Store className="h-5 w-5" /> Volver a la tienda
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all mt-1">
                <LogOut className="h-5 w-5" /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg">
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-foreground">Panel de Administración</h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notificaciones */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 animate-fade-in-up">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                        Marcar todas leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">No tienes notificaciones</p>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <Link
                          key={notif._id}
                          to={notif.link || '/admin/orders'}
                          onClick={() => setShowNotifications(false)}
                          className={`block p-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                            !notif.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                            {!notif.read && <span className="h-2 w-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleString('es-CL')}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>

            {/* Usuario */}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@techstore.cl'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">{user?.displayName?.charAt(0)?.toUpperCase() || 'A'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;