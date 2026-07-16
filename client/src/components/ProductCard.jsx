import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star, ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCLP } from '../utils/format';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

export const ProductCardSkeleton = () => (
  <Card className="overflow-hidden flex flex-col">
    <div className="aspect-square bg-muted animate-pulse" />
    <CardContent className="p-4 space-y-3 flex-1">
      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      <div className="h-5 w-full bg-muted rounded animate-pulse" />
      <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
      <div className="h-6 w-28 bg-muted rounded animate-pulse" />
    </CardContent>
    <div className="px-4 pb-4">
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
    </div>
  </Card>
);

const ProductCard = ({ product, variant = 'grid' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const hasDiscount = product.discount && product.discount > 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const active = isWishlisted(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistLoading(true);
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (hasVariants) {
      navigate(`/products/${product.slug}`);
      return;
    }
    addToCart(product._id, null, 1);
  };

  const imageUrl = getImageUrl(product.mainImage);

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <Link to={`/products/${product.slug}`} className="flex-1 flex flex-col">
        <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex-col items-center justify-center text-muted-foreground bg-muted/30 ${imageUrl ? 'hidden' : 'flex'}`}>
            <ImageOff className="h-8 w-8 mb-2" />
            <span className="text-xs">Sin imagen</span>
          </div>

          {product.badge && (
            <Badge className={`absolute top-3 left-3 shadow-md ${
              product.badge === 'Nuevo' ? 'bg-secondary text-secondary-foreground' :
              product.badge === 'Oferta' ? 'bg-primary text-primary-foreground animate-pulse' :
              product.badge === 'Agotado' ? 'bg-destructive text-destructive-foreground' :
              'bg-warning text-warning-foreground'
            }`}>
              {product.badge === 'Oferta' && hasDiscount ? `-${product.discount}%` : product.badge}
            </Badge>
          )}

          {/* Botones de acción rápida */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-lg border transition-colors ${
                active
                  ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                  : 'bg-gray-900 text-white border-gray-700 hover:bg-gray-800'
              }`}
              title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg border bg-gray-900 text-white border-gray-700 hover:bg-gray-800 transition-colors"
              title="Vista rápida"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <CardContent className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-primary font-medium">{product.category}</span>
            {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
          </div>
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-lg font-bold ${outOfStock ? 'text-muted-foreground' : 'text-foreground'}`}>
              {formatCLP(product.basePrice)}
            </span>
            {hasDiscount && product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCLP(product.originalPrice)}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({product.reviewCount || 0})</span>
            </div>
          )}
          {lowStock && !outOfStock && (
            <p className="text-xs text-warning mt-2">Solo quedan {product.stock} unidades</p>
          )}
        </CardContent>
      </Link>

      <div className="max-h-0 overflow-hidden group-hover:max-h-12 transition-all duration-300 ease-in-out">
        <div className="px-4 pb-4 pt-0">
          <Button className="w-full" disabled={outOfStock} onClick={handleAddToCart} variant={outOfStock ? 'outline' : 'default'}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {outOfStock ? 'Agotado' : hasVariants ? 'Ver opciones' : 'Agregar'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;