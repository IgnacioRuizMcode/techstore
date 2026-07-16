import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Zap,
  Laptop,
  Monitor,
  Cpu,
  Smartphone,
  Gamepad2,
  Headphones,
  Home,
  Wifi,
  Tablet,
  Paperclip,
  Truck,
  Shield,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Notebooks: Laptop,
  Computación: Monitor,
  Componentes: Cpu,
  Smartphones: Smartphone,
  Gaming: Gamepad2,
  Audio: Headphones,
  Hogar: Home,
  Conectividad: Wifi,
  Tablets: Tablet,
  Accesorios: Paperclip,
};

const VALID_CATEGORIES = [
  'Notebooks', 'Computación', 'Componentes', 'Smartphones',
  'Gaming', 'Audio', 'Hogar', 'Conectividad', 'Tablets', 'Accesorios',
];

// Marcas que aparecerán (puedes ajustar nombres y productos genéricos)
const BRANDS = [
  { name: 'Apple', query: 'apple' },
  { name: 'Samsung', query: 'samsung' },
  { name: 'ASUS', query: 'asus' },
  { name: 'MSI', query: 'msi' },
  { name: 'Gigabyte', query: 'gigabyte' },
  { name: 'Logitech', query: 'logitech' },
  { name: 'HyperX', query: 'hyperx' },
  { name: 'Kingston', query: 'kingston' },
];

const BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&h=400&fit=crop',
    title: 'Notebooks Gamer',
    description: 'Potencia y rendimiento para tus partidas',
    link: '/products?category=Notebooks',
    gradient: 'from-blue-900/80 to-purple-900/60',
  },
  {
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&h=400&fit=crop',
    title: 'Smartphones de última generación',
    description: 'Descubre los nuevos lanzamientos',
    link: '/products?category=Smartphones',
    gradient: 'from-violet-900/80 to-pink-900/60',
  },
  {
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&h=400&fit=crop',
    title: 'Componentes PC',
    description: 'Arma tu setup soñado con los mejores componentes',
    link: '/products?category=Componentes',
    gradient: 'from-emerald-900/80 to-teal-900/60',
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Cargar todos los productos
  useEffect(() => {
    api.get('/products')
      .then(res => {
        const valid = res.data.data.filter(p => VALID_CATEGORIES.includes(p.category));
        setAllProducts(valid);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Carrusel automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Datos derivados
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
  const featuredProducts = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
  const bestSellers = [...allProducts].sort((a, b) => b.stock - a.stock).slice(0, 4);
  const newProducts = [...allProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  // Obtener imagen de producto por marca
  const getBrandImage = (brandName) => {
    const product = allProducts.find(p => p.brand === brandName && p.mainImage);
    if (product?.mainImage) {
      if (product.mainImage.startsWith('http')) return product.mainImage;
      return `http://localhost:5000${product.mainImage}`;
    }
    // Imagen genérica de Unsplash si no hay producto de la marca
    return `https://source.unsplash.com/featured/?${brandName.toLowerCase()},technology`;
  };

  const nextBanner = () => setCurrentBanner(prev => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBanner(prev => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <>
      <Helmet>
        <title>TechStore Chile - Tecnología que impulsa tu mundo</title>
        <meta name="description" content="Tu tienda de tecnología en Chile. Notebooks, smartphones, gaming, componentes y más. Envío rápido a todo Chile." />
      </Helmet>

      {/* ========== CARRUSEL DE BANNERS ========== */}
      <section className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
        {BANNERS.map((banner, index) => (
          <Link
            key={index}
            to={banner.link}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} z-10`} />
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {banner.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 max-w-lg drop-shadow-md">
                {banner.description}
              </p>
              <Button asChild variant="secondary" size="lg" className="w-fit">
                <span>Ver productos <ArrowRight className="ml-2 h-5 w-5" /></span>
              </Button>
            </div>
          </Link>
        ))}

        {/* Controles del carrusel */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentBanner ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ========== OFERTAS DESTACADAS ========== */}
      {featuredProducts.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-8 md:mb-10">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">
                  Ofertas destacadas
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Aprovecha los mejores precios en productos seleccionados
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="md:size-default">
                <Link to="/products?sort=price-asc">Ver todas las ofertas →</Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {featuredProducts.map(prod => (
                  <ProductCard
                    key={prod._id}
                    product={{
                      ...prod,
                      badge: 'Oferta',
                      discount: 15,
                      originalPrice: Math.round(prod.basePrice * 1.15),
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== MÁS VENDIDOS ========== */}
      {bestSellers.length > 0 && (
        <section className="py-14 md:py-20 bg-gradient-to-b from-card/50 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-8 md:mb-10">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">
                  Más vendidos
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Lo que todos están comprando esta semana
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="md:size-default">
                <Link to="/products">Ver todos →</Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {bestSellers.map(prod => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== CATEGORÍAS ========== */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Explora por categoría
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas en nuestras categorías especializadas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, index) => {
              const IconComponent = CATEGORY_ICONS[cat] || Paperclip;
              return (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="group relative flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative z-10 p-3 md:p-4 rounded-xl bg-muted/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    <IconComponent className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <span className="relative z-10 text-xs md:text-sm font-medium text-foreground">{cat}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== NOVEDADES ========== */}
      {newProducts.length > 0 && (
        <section className="py-14 md:py-20 bg-gradient-to-b from-card/50 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-8 md:mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground">Novedades</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Lo más reciente en tecnología</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="md:size-default">
                <Link to="/products">Ver todos →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {newProducts.map(prod => (
                <ProductCard key={prod._id} product={{ ...prod, badge: 'Nuevo' }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CARACTERÍSTICAS ========== */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Truck, title: 'Envío express', description: 'Despacho en 24-48 horas a todo Chile. Gratis en compras sobre $59.990', highlight: 'Gratis sobre $59.990' },
              { icon: Shield, title: 'Compra segura', description: 'Tus datos protegidos con encriptación SSL y pago con Webpay Plus', highlight: '100% seguro' },
              { icon: MessageSquare, title: 'Soporte 24/7', description: 'Atención personalizada vía chat, teléfono o email cuando lo necesites', highlight: 'Siempre disponible' },
              { icon: Award, title: 'Garantía oficial', description: 'Todos nuestros productos cuentan con garantía oficial de fábrica', highlight: 'Hasta 3 años' },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-5 md:p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="p-2.5 md:p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs font-medium text-primary bg-primary/10">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-base md:text-lg text-foreground mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== MARCAS CON IMÁGENES DE PRODUCTOS ========== */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Marcas que nos respaldan
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Trabajamos con las mejores marcas del mundo
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={`/products?search=${encodeURIComponent(brand.name)}`}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {/* Imagen de fondo */}
                <img
                  src={getBrandImage(brand.name)}
                  alt={brand.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Si falla la imagen, usar un color sólido
                    e.target.style.display = 'none';
                  }}
                />
                {/* Overlay degradado para que el texto sea legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Nombre de la marca */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
                  <h3 className="text-white font-bold text-base md:text-lg drop-shadow-lg text-center">
                    {brand.name}
                  </h3>
                  <span className="text-white/80 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver productos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;