import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import WishlistButton from '../components/WishlistButton';
import StockNotifyButton from '../components/StockNotifyButton';
import ProductReviews from '../components/ProductReviews';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Minus,
  Plus,
  ShoppingCart,
  Star,
  ChevronRight,
  Zap,
  Truck,
  Shield,
  RefreshCw,
  Clock,
  Check,
  MessageSquare,
  Share2,
  Loader2,
  Bell,
} from 'lucide-react';

// Formato de moneda CLP
const formatCLP = (price) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);

// Reseñas de ejemplo (se muestran si no hay reseñas reales)
const mockReviews = [
  {
    _id: 'mock1',
    user: { displayName: 'Carlos M.' },
    rating: 5,
    comment:
      'Excelente laptop, el rendimiento del M3 Pro es impresionante. La pantalla es hermosa y la batería dura todo el día. Lo uso para desarrollo de software y funciona de maravilla con múltiples IDE abiertos.',
    createdAt: '2024-05-15T00:00:00Z',
    verified: true,
    helpful: 24,
  },
  {
    _id: 'mock2',
    user: { displayName: 'María L.' },
    rating: 4,
    comment:
      'Muy buena compra, aunque el precio es alto. El envío fue rápido y el producto llegó en perfectas condiciones. La única queja es que el cargador podría ser más compacto.',
    createdAt: '2024-05-10T00:00:00Z',
    verified: true,
    helpful: 12,
  },
  {
    _id: 'mock3',
    user: { displayName: 'Juan P.' },
    rating: 5,
    comment:
      'El mejor notebook que he tenido. Lo uso para programar y editar video, funciona de maravilla. La calidad de construcción es impecable y el trackpad es simplemente el mejor del mercado.',
    createdAt: '2024-05-05T00:00:00Z',
    verified: false,
    helpful: 18,
  },
];

// Función para obtener la URL de la imagen (maneja URLs externas y locales)
const getImageUrl = (img) => {
  if (!img) return '/placeholder.svg';
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState('1');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  // Obtener producto principal
  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => setProduct(null));
  }, [slug]);

  // Obtener productos relacionados
  useEffect(() => {
    if (product?._id) {
      api
        .get(`/products/${product._id}/related`)
        .then((res) => setRelatedProducts(res.data.data))
        .catch(() => setRelatedProducts([]));
    }
  }, [product]);

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  // Skeleton mientras carga
  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-muted" />
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-10 bg-muted rounded w-48" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
              <div className="h-14 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Datos calculados
  const maxStock = selectedVariant
    ? Math.max(selectedVariant.stock, 0)
    : Math.max(product.stock, 0);
  const outOfStock = maxStock === 0;
  const isMaxReached = quantity >= maxStock;
  const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const originalPrice = product.originalPrice || undefined;
  const discountPercentage = originalPrice
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;

  const syncQuantity = (newQty) => {
    const clamped = Math.max(1, Math.min(newQty, maxStock));
    setQuantity(clamped);
    setInputValue(String(clamped));
  };

  const handleAddToCart = async () => {
    if (outOfStock || isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product._id, selectedVariant?._id, quantity);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | TechStore</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
        <meta property="og:title" content={`${product.name} | TechStore`} />
        <meta property="og:description" content={product.description?.substring(0, 160)} />
        <meta property="og:image" content={getImageUrl(product.mainImage)} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">
            Catálogo
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                to={`/products?category=${product.category.toLowerCase()}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* ========== PRODUCT SECTION ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden group">
              <img
                src={getImageUrl(allImages[selectedImage])}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-300 group-hover:scale-105 product-image-zoom"
                onError={(e) => {
                  e.target.src = '/placeholder.svg';
                }}
              />
              {originalPrice && discountPercentage > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-lg animate-pulse-glow">
                  -{discountPercentage}% OFF
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                      idx === selectedImage
                        ? 'border-primary shadow-md shadow-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.category && (
                    <Link
                      to={`/products?category=${product.category.toLowerCase()}`}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      {product.category}
                    </Link>
                  )}
                  {product.brand && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{product.brand}</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <WishlistButton productId={product._id} />
                <button
                  className="p-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                  aria-label="Compartir"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{product.rating}</span>
                {product.reviewCount && (
                  <Link
                    to="#reviews"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    ({product.reviewCount} reseñas)
                  </Link>
                )}
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-muted-foreground mb-4">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <p className="text-4xl font-bold text-foreground">
                {formatCLP(currentPrice)}
              </p>
              {originalPrice && discountPercentage > 0 && (
                <p className="text-lg text-muted-foreground line-through mb-1">
                  {formatCLP(originalPrice)}
                </p>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              {outOfStock ? (
                <Badge variant="destructive" className="font-semibold">
                  Agotado
                </Badge>
              ) : maxStock <= 3 ? (
                <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 font-semibold">
                  Solo {maxStock} disponibles
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-500 border-green-500 font-semibold">
                  <Check className="h-4 w-4 mr-1" />
                  En stock
                </Badge>
              )}
            </div>

            {/* Description excerpt */}
            <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Configuración</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => {
                        setSelectedVariant(v);
                        syncQuantity(1);
                      }}
                      disabled={v.stock === 0}
                      className={`p-4 text-left rounded-xl border-2 transition-all ${
                        selectedVariant?._id === v._id
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : v.stock === 0
                          ? 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{v.name}</p>
                        {selectedVariant?._id === v._id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        {v.price > product.basePrice ? (
                          <p className="text-xs text-muted-foreground">
                            +{formatCLP(v.price - product.basePrice)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Precio base</p>
                        )}
                        {v.stock === 0 ? (
                          <p className="text-xs text-destructive">Agotado</p>
                        ) : v.stock <= 3 ? (
                          <p className="text-xs text-yellow-500">Stock bajo: {v.stock}</p>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {!outOfStock ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Cantidad</h3>
                  <div className="inline-flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => syncQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-3 text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      className="w-14 text-center text-lg font-medium text-foreground bg-muted/30 border-x border-border py-2 outline-none"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={() => {
                        const parsed = parseInt(inputValue, 10);
                        if (isNaN(parsed) || parsed < 1) syncQuantity(1);
                        else if (parsed > maxStock) syncQuantity(maxStock);
                        else syncQuantity(parsed);
                      }}
                      disabled={outOfStock}
                    />
                    <button
                      onClick={() => syncQuantity(quantity + 1)}
                      disabled={isMaxReached}
                      className="p-3 text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {isMaxReached && (
                    <p className="text-yellow-500 text-sm mt-1">
                      Máximo disponible alcanzado
                    </p>
                  )}
                  {/* ===== SUBTOTAL DINÁMICO ===== */}
                  <p className="text-sm text-muted-foreground mt-2">
                    Total: <span className="font-bold text-primary">{formatCLP(currentPrice * quantity)}</span>
                  </p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Agregar al carrito
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Bell className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Avisarme cuando esté disponible
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Te notificaremos cuando vuelva a haber stock
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button variant="secondary">Notificarme</Button>
                </div>
              </div>
            )}

            {/* Stock notification button (componente existente) */}
            <div className="mt-4">
              <StockNotifyButton productId={product._id} outOfStock={outOfStock} />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Envío gratis</p>
                  <p className="text-xs text-muted-foreground">En compras +$59.990</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Garantía</p>
                  <p className="text-xs text-muted-foreground">1 año oficial</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <RefreshCw className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Devolución</p>
                  <p className="text-xs text-muted-foreground">30 días sin costo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Entrega</p>
                  <p className="text-xs text-muted-foreground">24-48 horas hábiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== FEATURES & DESCRIPTION ========== */}
        {product.features && product.features.length > 0 && (
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Características destacadas
                  </h2>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Descripción del producto
                  </h2>
                  <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <p>{product.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========== REVIEWS SECTION ========== */}
        <section id="reviews" className="mb-16 scroll-mt-24">
          <ProductReviews productId={product._id} mockData={mockReviews} />
        </section>

        {/* ========== RELATED PRODUCTS (DESDE API) ========== */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Productos relacionados</h2>
              <p className="text-muted-foreground mt-1">
                Complementa tu compra con estos productos
              </p>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(product.category || '')}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver más <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard
                  key={rp._id}
                  product={{
                    slug: rp.slug,
                    name: rp.name,
                    basePrice: rp.basePrice,
                    mainImage: rp.mainImage,
                    rating: rp.rating || 0,
                    reviewCount: rp.reviewCount || 0,
                    brand: rp.brand,
                    category: rp.category,
                    stock: rp.stock,
                    discount: 0,
                    originalPrice: null,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No hay productos relacionados en esta categoría.
            </p>
          )}
        </section>
      </main>
    </>
  );
};

export default ProductDetailPage;