import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  Settings,
} from 'lucide-react';

const ProfilePage = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{user?.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator className="mb-4" />
            <nav className="flex flex-col gap-1">
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> Resumen
              </Link>
              <Link
                to="/profile/orders"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profile/orders') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <ClipboardList className="h-4 w-4" /> Mis Pedidos
              </Link>
              <Link
                to="/profile/wishlist"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profile/wishlist') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Heart className="h-4 w-4" /> Favoritos
              </Link>
              <Link
                to="/profile/settings"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profile/settings') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Settings className="h-4 w-4" /> Configuración
              </Link>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 bg-card border border-border rounded-2xl p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;