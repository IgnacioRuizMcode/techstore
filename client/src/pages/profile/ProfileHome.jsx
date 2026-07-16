import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCLP } from '../../utils/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight, ClipboardList, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'outline', icon: Clock },
  paid: { label: 'Pagado', variant: 'default', icon: CheckCircle },
  preparing: { label: 'Preparando', variant: 'secondary', icon: Package },
  shipped: { label: 'Enviado', variant: 'default', icon: Truck },
  out_for_delivery: { label: 'En reparto', variant: 'secondary', icon: Truck },
  delivered: { label: 'Entregado', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
};

const ProfileHome = () => {
  const [stats, setStats] = useState({ orders: 0, recentOrder: null });

  useEffect(() => {
    api.get('/orders/mine')
      .then(res => {
        const orders = res.data.data;
        setStats({
          orders: orders.length,
          recentOrder: orders.length > 0 ? orders[0] : null,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Resumen de actividad</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{stats.orders}</h3>
                <p className="text-sm text-muted-foreground">Pedidos realizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.recentOrder && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Último pedido</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-primary">
                  Pedido #{stats.recentOrder._id.slice(-8).toUpperCase()}
                </span>
                <Badge variant={(statusConfig[stats.recentOrder.status] || statusConfig.pending).variant}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border">
                  {React.createElement((statusConfig[stats.recentOrder.status] || statusConfig.pending).icon, { className: "h-3 w-3" })}
                  {(statusConfig[stats.recentOrder.status] || statusConfig.pending).label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  Total: {formatCLP(stats.recentOrder.total)}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/profile/orders/${stats.recentOrder._id}`}>
                    Ver detalle <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfileHome;