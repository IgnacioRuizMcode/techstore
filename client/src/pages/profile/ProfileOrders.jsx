import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Truck,
  Store,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Traducción y colores de estado
const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const statusBadgeVariant = (status) => {
  const map = {
    pending: 'outline',
    paid: 'default',
    preparing: 'secondary',
    shipped: 'default',
    out_for_delivery: 'secondary',
    delivered: 'default',
    cancelled: 'destructive',
  };
  return map[status] || 'outline';
};

const ProfileOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine')
      .then(res => setOrders(res.data.data))
      .catch(console.error);
  }, []);

  if (!orders.length) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No has realizado ninguna compra aún.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Mis pedidos</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <Link to={`/profile/orders/${order._id}`} key={order._id} className="block">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <Badge variant={statusBadgeVariant(order.status)}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  {order.deliveryMethod === 'pickup' ? (
                    <><Store className="h-4 w-4" /> Retiro en tienda</>
                  ) : (
                    <><Truck className="h-4 w-4" /> {order.shippingAddress || 'Envío a domicilio'}</>
                  )}
                </div>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span>
                        ${((item.totalPrice || item.netPrice || 0) * item.quantity).toLocaleString('es-CL')}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      ...y {order.items.length - 3} productos más
                    </p>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toLocaleString('es-CL')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(order.createdAt).toLocaleDateString('es-CL')}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileOrders;