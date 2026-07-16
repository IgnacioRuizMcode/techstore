import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCLP } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X } from 'lucide-react';

const getImageUrl = (img) => {
  if (!img) return '/placeholder.svg';
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

const ProfileWishlist = () => {
  const { items, loading, removeFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted" />
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-5 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Mis Favoritos</h2>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tienes productos en tu lista de deseos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <Card key={item._id} className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => removeFromWishlist(item.product._id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Link to={`/products/${item.product?.slug}`}>
                <div className="aspect-square bg-muted/30 p-4">
                  <img
                    src={getImageUrl(item.product?.mainImage)}
                    alt={item.product?.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/placeholder.svg'; }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2">{item.product?.name}</h3>
                  <span className="text-lg font-bold text-primary mt-2">
                    {formatCLP(item.product?.basePrice)}
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileWishlist;