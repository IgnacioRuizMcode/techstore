import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  ChevronRight,
  Truck,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PackageSearch,
} from 'lucide-react';

// Mapeo de estados a variantes de Badge e íconos
const statusConfig = {
  pending: { label: 'Pendiente', variant: 'outline', icon: Clock },
  paid: { label: 'Pagado', variant: 'default', icon: CheckCircle },
  preparing: { label: 'Preparando', variant: 'secondary', icon: Package },
  shipped: { label: 'Enviado', variant: 'default', icon: Truck },
  out_for_delivery: { label: 'En reparto', variant: 'secondary', icon: Truck },
  delivered: { label: 'Entregado', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
};

// Skeleton para estado de carga
const OrderSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
      <div className="h-6 w-20 bg-muted rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-4 w-1/2 bg-muted rounded" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="h-6 w-28 bg-muted rounded" />
    </div>
  </div>
);

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/mine');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const isEmpty = !loading && orders.length === 0;

  // Función para interpretar el método de entrega
  const getDeliveryInfo = (order) => {
    const method = order.deliveryMethod;
    // Si es exactamente "pickup" o contiene "pickup"/"retiro", mostramos retiro en tienda
    if (typeof method === 'string' && (method === 'pickup' || method.includes('retiro'))) {
      return {
        icon: Store,
        text: 'Retiro en tienda',
      };
    }
    // En cualquier otro caso (número, string no reconocido, undefined) mostramos envío a domicilio
    return {
      icon: Truck,
      text: order.shippingAddress || 'Envío a domicilio',
    };
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/profile" className="hover:text-foreground transition-colors">Mi cuenta</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Mis pedidos</span>
      </nav>

      {/* Header de página */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis pedidos</h1>
          <p className="text-muted-foreground text-sm">
            Revisa el estado de tus compras
          </p>
        </div>
      </div>

      {/* Estado: Loading */}
      {loading && (
        <div className="space-y-4">
          <OrderSkeleton />
          <OrderSkeleton />
          <OrderSkeleton />
        </div>
      )}

      {/* Estado: Sin pedidos */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
            <div className="relative p-6 bg-muted/50 rounded-full">
              <PackageSearch className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Aún no has realizado ninguna compra
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Explora nuestro catálogo y encuentra los mejores productos de tecnología para ti.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all"
          >
            Explorar catálogo
          </Link>
        </div>
      )}

      {/* Estado: Con pedidos */}
      {!loading && !isEmpty && (
        <>
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const delivery = getDeliveryInfo(order);
              const DeliveryIcon = delivery.icon;

              return (
                <Link
                  key={order._id}
                  to={`/profile/orders/${order._id}`}
                  className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header del pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold text-primary text-lg">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <Badge
                      variant={status.variant}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border"
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Método de entrega */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <DeliveryIcon className="h-4 w-4" />
                    <span>{delivery.text}</span>
                  </div>

                  {/* Lista de productos (solo nombre y cantidad, sin precio) */}
                  <div className="space-y-1 mb-4">
                    {order.items.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-sm text-foreground">
                        {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                      </p>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        ...y {order.items.length - 3} producto{order.items.length - 3 > 1 ? 's' : ''} más
                      </p>
                    )}
                  </div>

                  {/* Footer con total */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Total del pedido</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-lg">
                        ${order.total.toLocaleString('es-CL')}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Nota informativa */}
          <div className="mt-8 p-4 bg-muted/50 border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">¿Tienes algún problema con tu pedido?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Puedes contactar a nuestro equipo de soporte haciendo clic en cualquier pedido y seleccionando "Reportar problema".
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default OrderHistoryPage;