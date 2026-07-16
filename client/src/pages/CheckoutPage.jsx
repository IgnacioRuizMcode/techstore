import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  ShieldCheck,
  X,
  Truck,
  Store,
  MapPin,
  Home,
  Loader2,
} from 'lucide-react';

const IVA_RATE = 0.19;

// Helper para obtener la URL correcta de la imagen
const getImageUrl = (img) => {
  if (!img) return '/placeholder.svg';
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

const CheckoutPage = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const discount = location.state?.discount || 0;
  const couponCode = location.state?.couponCode || '';

  const [deliveryMethod, setDeliveryMethod] = useState('shipping');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponApplied, setCouponApplied] = useState(!!couponCode);
  const [couponInput, setCouponInput] = useState(couponCode);

  // Determinar si el usuario tiene una dirección guardada en su perfil
  const savedAddress = user?.address?.street
    ? `${user.address.street}, ${user.address.city || ''}, ${user.address.state || ''}`
    : '';
  const [useSavedAddress, setUseSavedAddress] = useState(!!savedAddress);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netSubtotal = Math.round(subtotal / (1 + IVA_RATE));
  const iva = subtotal - netSubtotal;
  const shippingCost = deliveryMethod === 'shipping' ? (subtotal >= 59990 ? 0 : 5000) : 0;
  const total = Math.max(subtotal - discount + shippingCost, 0);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      if (cart.items.length === 0) {
        setError('El carrito está vacío.');
        setLoading(false);
        return;
      }
      if (deliveryMethod === 'shipping') {
        const finalAddress = useSavedAddress ? savedAddress : shippingAddress;
        if (!finalAddress.trim()) {
          setError('Ingresa una dirección de envío.');
          setLoading(false);
          return;
        }
        const res = await api.post('/orders', {
          shippingAddress: finalAddress,
          couponCode: couponApplied ? couponCode : null,
          deliveryMethod,
        });
        if (res.data.url && res.data.token) {
          // Crear formulario POST para Transbank
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = res.data.url;
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'token_ws';
          input.value = res.data.token;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        } else {
          setError('No se recibió la URL de pago.');
          setLoading(false);
        }
      } else {
        // Retiro en tienda
        const res = await api.post('/orders', {
          shippingAddress: 'Retiro en tienda',
          couponCode: couponApplied ? couponCode : null,
          deliveryMethod,
        });
        if (res.data.url && res.data.token) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = res.data.url;
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'token_ws';
          input.value = res.data.token;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        } else {
          setError('No se recibió la URL de pago.');
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const format = (n) => n.toLocaleString('es-CL');

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-6">Agrega productos antes de finalizar la compra.</p>
        <Button asChild><Link to="/products">Explorar catálogo</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet><title>Checkout | TechStore</title></Helmet>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Inicio</Link> <span>›</span>
        <Link to="/products" className="hover:text-foreground">Catálogo</Link> <span>›</span>
        <span className="text-foreground">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Productos en tu pedido</h3>
            {cart.items.map((item) => (
              <div key={item._id || item.product?._id} className="flex gap-3 py-3 border-b border-border last:border-0">
                <img
                  src={getImageUrl(item.product?.mainImage)}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => { e.target.src = '/placeholder.svg'; }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.product?.name}</h4>
                  <p className="text-sm text-muted-foreground">Cant: {item.quantity} | Unit: ${format(item.price)}</p>
                  <p className="text-sm font-semibold text-primary">Subtotal: ${format(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Entrega */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Método de entrega</h3>
            <div className="space-y-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  deliveryMethod === 'shipping' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="shipping"
                  checked={deliveryMethod === 'shipping'}
                  onChange={() => setDeliveryMethod('shipping')}
                  className="text-primary"
                />
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span>
                  Envío a domicilio{' '}
                  {shippingCost > 0 ? (
                    `(+$${format(shippingCost)})`
                  ) : (
                    <Badge variant="outline" className="text-primary ml-1">
                      Gratis
                    </Badge>
                  )}
                </span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                  className="text-primary"
                />
                <Store className="h-5 w-5 text-muted-foreground" />
                <span>Retiro en tienda (sin costo)</span>
              </label>
            </div>

            {/* Dirección de envío */}
            {deliveryMethod === 'shipping' && (
              <div className="mt-4 space-y-3">
                {/* Opción de dirección guardada */}
                {savedAddress && (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      useSavedAddress ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressType"
                      checked={useSavedAddress}
                      onChange={() => setUseSavedAddress(true)}
                      className="mt-1 text-primary"
                    />
                    <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Usar dirección guardada
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{savedAddress}</p>
                    </div>
                  </label>
                )}

                {/* Opción de otra dirección */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    !useSavedAddress ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressType"
                    checked={!useSavedAddress}
                    onChange={() => setUseSavedAddress(false)}
                    className="mt-1 text-primary"
                  />
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm font-medium text-foreground">
                    {savedAddress ? 'Otra dirección' : 'Nueva dirección'}
                  </span>
                </label>

                {!useSavedAddress && (
                  <div className="mt-2">
                    <AddressAutocomplete
                      label=""
                      placeholder="Busca tu dirección..."
                      value={shippingAddress}
                      onChange={(val) => setShippingAddress(val)}
                      onSelect={(data) => setShippingAddress(data.formattedAddress)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cupón */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Cupón de descuento</h3>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-primary/10 p-3 rounded-xl">
                <span className="text-sm">
                  Cupón <strong>{couponCode}</strong> aplicado (-${format(discount)})
                </span>
                <Button variant="ghost" size="sm" onClick={() => setCouponApplied(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Código de cupón"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <Button variant="outline" onClick={() => setCouponApplied(true)}>
                  Aplicar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-card border border-border rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resumen del pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal (neto)</span>
              <span>${format(netSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (19%)</span>
              <span>${format(iva)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Descuento</span>
                <span>-${format(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{shippingCost === 0 ? 'Gratis' : `$${format(shippingCost)}`}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${format(total)}</span>
            </div>
          </div>

          {error && <p className="text-destructive text-sm mt-3">{error}</p>}

          <Button
            className="w-full mt-4"
            size="lg"
            disabled={loading}
            onClick={handlePayment}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo a Webpay...
              </>
            ) : (
              `Pagar $${format(total)}`
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Pago seguro con Webpay Plus
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;