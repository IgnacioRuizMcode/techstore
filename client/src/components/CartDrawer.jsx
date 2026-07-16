import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Minus, Plus, Trash2 } from 'lucide-react';

// Helper para obtener la URL correcta de la imagen
const getImageUrl = (img) => {
  if (!img) return '/placeholder.svg';
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeItem, itemCount } = useCart();
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel deslizante */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Tu Carrito ({itemCount})
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {cart.items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Tu carrito está vacío</p>
          ) : (
            cart.items.map(item => (
              <div key={item._id} className="flex gap-3 items-center">
                <img
                  src={getImageUrl(item.product?.mainImage)}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                  onError={(e) => { e.target.src = '/placeholder.svg'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.product?.name}</p>
                  {item.variantId && (
                    <p className="text-xs text-muted-foreground">Variante seleccionada</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-muted transition-colors rounded-l-lg"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-muted transition-colors rounded-r-lg"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                ${subtotal.toLocaleString('es-CL')}
              </span>
            </div>
            <Separator />
            <Link to="/cart" onClick={onClose} className="block">
              <Button variant="outline" className="w-full">
                Ver carrito completo
              </Button>
            </Link>
            <Link to="/checkout" onClick={onClose} className="block">
              <Button className="w-full">
                Ir a pagar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;