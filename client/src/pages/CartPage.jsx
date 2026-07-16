import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  ImageOff,
} from 'lucide-react';

// Helper para obtener la URL correcta de la imagen
const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

const CartPage = () => {
  const { cart, updateQuantity, removeItem, itemCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const iva = Math.round(subtotal * 0.19);
  const total = Math.max(subtotal - discount, 0);

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        cartTotal: subtotal,
      });
      setDiscount(res.data.discount);
      setCouponApplied(true);
    } catch (err) {
      setDiscount(0);
      setCouponApplied(false);
      setCouponError(err.response?.data?.message || 'Cupón inválido');
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponApplied(false);
    setCouponCode('');
    setCouponError('');
  };

  // Estado vacío
  if (!cart.items.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
          <div className="relative p-6 bg-muted/50 rounded-full">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Explora nuestro catálogo y encuentra los mejores productos de tecnología para ti.
        </p>
        <Button asChild size="lg">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Explorar catálogo
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Tu Carrito
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Seguir comprando
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item._id}
              className="bg-card border border-border rounded-2xl p-4 flex gap-4 hover:border-primary/30 transition-colors"
            >
              {/* Imagen */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted/50 overflow-hidden shrink-0 border border-border/50">
                {getImageUrl(item.product?.mainImage) ? (
                  <img
                    src={getImageUrl(item.product?.mainImage)}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex-col items-center justify-center text-muted-foreground ${
                    getImageUrl(item.product?.mainImage) ? 'hidden' : 'flex'
                  }`}
                >
                  <ImageOff className="h-5 w-5 mb-1" />
                  <span className="text-[10px]">Sin imagen</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {item.product?.name}
                    </h4>
                    {item.product?.category && (
                      <p className="text-xs text-muted-foreground">{item.product.category}</p>
                    )}
                    {item.variantId && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Variante seleccionada
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item._id)}
                    className="text-muted-foreground hover:text-destructive shrink-0 self-start"
                    title="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                  {/* Control de cantidad */}
                  <div className="flex items-center border border-border rounded-lg w-fit">
                    <button
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors rounded-l-lg disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-sm font-medium min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors rounded-r-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Precios */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toLocaleString('es-CL')} c/u
                    </p>
                    <p className="font-semibold text-primary">
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Resumen del pedido
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (19%)</span>
              <span className="text-foreground">${iva.toLocaleString('es-CL')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Descuento</span>
                <span>-${discount.toLocaleString('es-CL')}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* Cupón */}
          <div className="mt-5">
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5" /> Cupón de descuento
            </label>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-500/10 p-3 rounded-xl">
                <span className="text-sm text-green-600 font-medium">
                  Cupón aplicado: -${discount.toLocaleString('es-CL')}
                </span>
                <Button variant="ghost" size="sm" onClick={removeCoupon} className="h-7 text-xs">
                  Quitar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: DESCUENTO10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <Button variant="outline" size="sm" onClick={applyCoupon}>
                    Aplicar
                  </Button>
                </div>
                {couponError && (
                  <p className="text-destructive text-xs">{couponError}</p>
                )}
              </div>
            )}
          </div>

          <Button asChild className="w-full mt-5" size="lg">
            <Link to="/checkout" state={{ discount, couponCode: couponApplied ? couponCode : '' }}>
              Ir a pagar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Pago seguro con Webpay Plus
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;