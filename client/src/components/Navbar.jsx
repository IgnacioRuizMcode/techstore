import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartDrawer from './CartDrawer';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Menu,
  ShoppingCart,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Laptop,
  Monitor,
  Cpu,
  Smartphone,
  Tablet,
  Headphones,
  Gamepad2,
  Home,
  Wifi,
  Paperclip,
  Settings,
  ClipboardList,
  Heart,
  LogIn,
  UserPlus,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Fan,
  Power,
  MonitorUp,
  Keyboard,
  Mouse,
  Camera,
  Speaker,
  Router,
  Cable,
  Watch,
  Tv,
} from 'lucide-react';

// Categorías principales con subcategorías
const CATEGORIAS = [
  {
    icon: Laptop,
    name: 'Notebooks',
    subcategories: [
      { label: 'Notebooks Gamer', search: 'gamer' },
      { label: 'Ultrabooks', search: 'ultrabook' },
      { label: 'MacBook', search: 'macbook' },
      { label: 'Workstation', search: 'workstation' },
      { label: '2 en 1', search: '2 en 1' },
    ],
  },
  {
    icon: Monitor,
    name: 'Computación',
    subcategories: [
      { label: 'PC Escritorio', search: 'escritorio' },
      { label: 'PC Gamer', search: 'gamer pc' },
      { label: 'All-in-One', search: 'all in one' },
      { label: 'Mac', search: 'mac' },
      { label: 'Mini PC', search: 'mini pc' },
    ],
  },
  {
    icon: Cpu,
    name: 'Componentes',
    subcategories: [
      { label: 'CPU Intel', search: 'Intel Core' },
      { label: 'CPU AMD Ryzen', search: 'Ryzen' },
      { label: 'GPU NVIDIA', search: 'NVIDIA' },
      { label: 'GPU AMD Radeon', search: 'Radeon' },
      { label: 'Placas Madre', search: 'placa madre' },
      { label: 'RAM', search: 'RAM' },
      { label: 'SSD / Almacenamiento', search: 'SSD' },
      { label: 'Fuentes de Poder', search: 'fuente' },
      { label: 'Coolers / Refrigeración', search: 'cooler' },
    ],
  },
  {
    icon: Smartphone,
    name: 'Smartphones',
    subcategories: [
      { label: 'iPhone', search: 'iPhone' },
      { label: 'Samsung Galaxy', search: 'Samsung Galaxy' },
      { label: 'Xiaomi', search: 'Xiaomi' },
      { label: 'Google Pixel', search: 'Pixel' },
      { label: 'Gama Alta', search: 'Pro Max Ultra' },
      { label: 'Gama Media', search: 'A5' },
    ],
  },
  {
    icon: Tablet,
    name: 'Tablets',
    subcategories: [
      { label: 'iPad', search: 'iPad' },
      { label: 'Samsung Galaxy Tab', search: 'Galaxy Tab' },
      { label: 'Lenovo Tab', search: 'Lenovo Tab' },
      { label: 'Kindle / E-readers', search: 'Kindle' },
    ],
  },
  {
    icon: Headphones,
    name: 'Audio',
    subcategories: [
      { label: 'Audífonos Inalámbricos', search: 'audífonos' },
      { label: 'Audífonos Gamer', search: 'headset' },
      { label: 'Parlantes', search: 'parlante' },
      { label: 'Micrófonos', search: 'micrófono' },
      { label: 'Soundbars', search: 'soundbar' },
    ],
  },
  {
    icon: Gamepad2,
    name: 'Gaming',
    subcategories: [
      { label: 'Consolas', search: 'PlayStation Xbox Nintendo' },
      { label: 'Controles', search: 'control' },
      { label: 'Teclados Gamer', search: 'teclado gamer' },
      { label: 'Mouse Gamer', search: 'mouse gamer' },
      { label: 'Monitores Gamer', search: 'monitor gamer' },
      { label: 'Sillas Gamer', search: 'silla gamer' },
    ],
  },
  {
    icon: Home,
    name: 'Hogar',
    subcategories: [
      { label: 'Smartwatches', search: 'watch' },
      { label: 'Asistentes Virtuales', search: 'Echo Google Home' },
      { label: 'Cámaras de Seguridad', search: 'cámara seguridad' },
      { label: 'Routers / WiFi', search: 'router wifi' },
      { label: 'Smart TV', search: 'TV' },
    ],
  },
  {
    icon: Wifi,
    name: 'Conectividad',
    subcategories: [
      { label: 'Cables USB / HDMI', search: 'cable' },
      { label: 'Hubs / Adaptadores', search: 'hub adaptador' },
      { label: 'Cargadores', search: 'cargador' },
      { label: 'Redes / Ethernet', search: 'ethernet' },
      { label: 'Thunderbolt', search: 'thunderbolt' },
    ],
  },
  {
    icon: Paperclip,
    name: 'Accesorios',
    subcategories: [
      { label: 'Teclados', search: 'teclado' },
      { label: 'Mouse', search: 'mouse' },
      { label: 'Webcams', search: 'webcam' },
      { label: 'Mochilas / Fundas', search: 'mochila funda' },
      { label: 'Soportes / Bases', search: 'soporte base' },
      { label: 'Mousepads', search: 'mousepad' },
    ],
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <>
      {/* Banner promocional */}
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-b border-border/50">
        <div className="container mx-auto px-4 py-2">
          <p className="text-xs text-center text-muted-foreground">
            <span className="text-primary font-semibold">Envío gratis</span> en compras sobre $50.000
            <span className="hidden sm:inline"> | Cupones: <strong>MAYO5K</strong> y <strong>MAYO10K</strong></span>
          </p>
        </div>
      </div>

      {/* Navbar principal */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo y navegación */}
          <div className="flex items-center gap-6">
            {/* Menú móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-[320px] bg-card border-border flex flex-col">
                <SheetHeader className="shrink-0">
                  <SheetTitle className="text-foreground">Menú</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-2">
                  <form onSubmit={handleSearch} className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </form>
                  <nav className="flex flex-col gap-1 pb-4">
                    <Link to="/products" className="px-4 py-2 rounded-lg hover:bg-muted text-foreground">Catálogo</Link>
                    {CATEGORIAS.map(cat => (
                      <div key={cat.name} className="space-y-1">
                        <Link
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-foreground font-medium"
                        >
                          <cat.icon className="h-4 w-4" />
                          {cat.name}
                        </Link>
                        <div className="ml-6 space-y-0.5">
                          {cat.subcategories.map(sub => (
                            <Link
                              key={sub.label}
                              to={`/products?search=${encodeURIComponent(sub.search)}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            >
                              <ChevronRight className="h-3 w-3" />
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>

                  {!user && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-foreground">
                        <LogIn className="h-4 w-4" /> Iniciar sesión
                      </Link>
                      <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-foreground">
                        <UserPlus className="h-4 w-4" /> Registrarse
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Laptop className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Tech<span className="text-primary">Store</span>
              </span>
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/products" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                Catálogo
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                    Categorías
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 bg-card border-border shadow-2xl"
                  align="start"
                  sideOffset={8}
                >
                  {CATEGORIAS.map(cat => (
                    <DropdownMenuSub key={cat.name}>
                      <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer hover:bg-muted">
                        <cat.icon className="h-4 w-4" />
                        <span>{cat.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-52 bg-card border-border shadow-2xl">
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/products?category=${encodeURIComponent(cat.name)}`}
                            className="font-medium text-primary"
                          >
                            Ver todo {cat.name}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {cat.subcategories.map(sub => (
                          <DropdownMenuItem key={sub.label} asChild>
                            <Link
                              to={`/products?search=${encodeURIComponent(sub.search)}`}
                              className="text-sm"
                            >
                              {sub.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/products?category=Gaming" className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all">
                Gaming
              </Link>
            </nav>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Búsqueda desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2 w-40 lg:w-56 focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
              />
            </form>

            {user ? (
              <>
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoUrl} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-card border-border shadow-2xl"
                    sideOffset={8}
                  >
                    <DropdownMenuLabel className="text-foreground">{user.displayName}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Resumen
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                      <Link to="/profile/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                      <Link to="/profile/orders" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" /> Mis Pedidos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                      <Link to="/profile/wishlist" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Favoritos
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                        <Link to="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Administración
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive flex items-center gap-2 hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/login">Inicia sesión</Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={() => setCartOpen(true)} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;