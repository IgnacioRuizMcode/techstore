import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCLP } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Truck,
  Store,
  Package,
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  DollarSign,
  Hash,
  MapPin,
  User,
  Building,
  CreditCard,
  Phone,
  Mail,
} from 'lucide-react';

const COMPANIES = {
  starken: 'Starken',
  chilexpress: 'Chilexpress',
  correos_chile: 'Correos Chile',
  bluexpress: 'Bluexpress',
  pullman: 'Pullman Cargo',
  other: 'Otra empresa',
};

const STATUS_STEPS = [
  { key: 'pending', label: 'Pendiente', icon: Clock },
  { key: 'paid', label: 'Pagado', icon: CheckCircle },
  { key: 'preparing', label: 'Preparando', icon: Package },
  { key: 'shipped', label: 'Enviado', icon: Truck },
  { key: 'out_for_delivery', label: 'En reparto', icon: Truck },
  { key: 'delivered', label: 'Entregado', icon: CheckCircle },
];

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

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get('/orders/mine')
      .then(res => setOrder(res.data.data.find(o => o._id === orderId) || null))
      .catch(() => setOrder(null));
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boleta-${order._id.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar boleta');
    } finally {
      setDownloading(false);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Pedido no encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/profile/orders">Volver a mis pedidos</Link>
        </Button>
      </div>
    );
  }

  const getItemTotal = (item) => {
    const unitPrice = item.totalPrice || item.netPrice || 0;
    return unitPrice * item.quantity;
  };

  const itemsSubtotal = order.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const hasTaxBreakdown = order.subtotal !== undefined && order.ivaTotal !== undefined;
  const subtotalNeto = hasTaxBreakdown ? order.subtotal : Math.round(itemsSubtotal / 1.19);
  const iva = hasTaxBreakdown ? order.ivaTotal : itemsSubtotal - subtotalNeto;
  const orderDate = new Date(order.createdAt).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);

  const clientName = order.user?.displayName || 'Cliente';
  const clientEmail = order.user?.email || '';
  const clientAddress = order.shippingAddress || 'No especificada';

  return (
    <div>
      <Link to="/profile/orders" className="text-primary hover:underline text-sm mb-4 inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Volver a mis pedidos
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground">Detalle del pedido</h2>
        <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={downloading}>
          <FileText className="h-4 w-4 mr-2" />
          {downloading ? 'Descargando...' : 'Descargar boleta'}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Encabezado del pedido */}
          <div className="p-6 sm:p-8 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <span className="font-mono font-bold text-primary text-lg">
                    {order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{orderDate}</p>
              </div>
              <Badge variant={statusBadgeVariant(order.status)} className="text-sm px-3 py-1">
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>
          </div>

          {/* Línea de progreso */}
          <div className="p-6 sm:p-8 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4">Progreso del pedido</h4>
            <div className="flex justify-between items-start overflow-x-auto gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                    <div className={`relative p-2 rounded-full ${
                      isCompleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="p-6 sm:p-8 border-b border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Dirección de envío
            </h4>
            <p className="text-sm text-muted-foreground">{clientAddress}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
              {order.deliveryMethod === 'pickup' ? (
                <><Store className="h-4 w-4 text-primary" /> Retiro en tienda</>
              ) : (
                <><Truck className="h-4 w-4 text-primary" /> Envío a domicilio</>
              )}
            </p>
          </div>

          {/* Productos */}
          <div className="p-6 sm:p-8 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Productos
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Producto</th>
                    <th className="text-center py-2 font-medium text-muted-foreground w-16">Cant.</th>
                    <th className="text-right py-2 font-medium text-muted-foreground w-28">Precio Unit.</th>
                    <th className="text-right py-2 font-medium text-muted-foreground w-28">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => {
                    const unitPrice = item.totalPrice || item.netPrice || 0;
                    const subtotal = unitPrice * item.quantity;
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{item.name}</td>
                        <td className="py-3 text-center text-foreground">{item.quantity}</td>
                        <td className="py-3 text-right text-foreground">{formatCLP(unitPrice)}</td>
                        <td className="py-3 text-right font-medium text-foreground">{formatCLP(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de costos */}
          <div className="p-6 sm:p-8 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Resumen de costos
            </h4>
            <div className="space-y-2 text-sm max-w-xs ml-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal (neto)</span>
                <span className="text-foreground">{formatCLP(subtotalNeto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (19%)</span>
                <span className="text-foreground">{formatCLP(iva)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo de envío</span>
                  <span className="text-foreground">{formatCLP(order.shippingCost)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCLP(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingCompany && (
            <div className="p-6 sm:p-8 border-b border-border">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Información de envío
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Empresa:</strong> {COMPANIES[order.trackingCompany] || 'Otra'}
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Nº de tracking:</strong> {order.trackingNumber}
                </p>
                {order.trackingUrl && (
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> Hacer seguimiento
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Datos adicionales (cliente, comercio, pago) */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Cliente
                </h4>
                <p className="text-foreground">{clientName}</p>
                <p className="text-muted-foreground">{clientEmail}</p>
                <p className="text-muted-foreground">{clientAddress}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" /> TechStore Chile
                </h4>
                <p className="text-muted-foreground">RUT: 76.123.456-7</p>
                <p className="text-muted-foreground">Av. Providencia 1234, Santiago</p>
                <p className="text-muted-foreground">+56 2 2345 6789</p>
                <p className="text-muted-foreground">contacto@techstore.cl</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Pago
                </h4>
                <p className="text-foreground">Webpay Plus</p>
                <p className="text-muted-foreground text-xs break-all">
                  Transacción: {order._id.toString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de tracking (si existe) */}
      {order.trackingHistory?.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6 sm:p-8">
            <h4 className="font-semibold text-foreground mb-4">Historial de estados</h4>
            <div className="space-y-3">
              {order.trackingHistory.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                    {i < order.trackingHistory.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <span className="text-xs text-muted-foreground">{new Date(step.date).toLocaleString('es-CL')}</span>
                    <p className="text-sm text-foreground">{step.description}</p>
                    {step.location && <small className="text-muted-foreground">{step.location}</small>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailPage;