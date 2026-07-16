import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../contexts/WishlistContext';

const WishlistButton = ({ productId }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [loading, setLoading] = React.useState(false);
  const active = isWishlisted(productId);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await toggleWishlist(productId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-xl transition-colors ${
        active ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
      }`}
      title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <Heart className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
      )}
    </Button>
  );
};

export default WishlistButton;