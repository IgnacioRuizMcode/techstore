import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../services/api';
import { formatCLP } from '../../utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
  Plus,
  Tag,
  BarChart3,
  ChevronRight,
  Loader2,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const statusVariant = {
  pending: 'outline',
  paid: 'default',
  preparing: 'secondary',
  shipped: 'default',
  out_for_delivery: 'secondary',
  delivered: 'default',
  cancelled: 'destructive',
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

const AdminHome = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/dashboard')
      .then((res) => setDashboard(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando estadísticas...</span>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No se pudieron cargar las estadísticas.</p>
      </div>
    );
  }

  const dailyChartData = {
    labels: dashboard.dailySales.map((d) => d.date),
    datasets: [
      {
        label: 'Ventas (CLP)',
        data: dashboard.dailySales.map((d) => d.total),
        backgroundColor: '#06b6d4',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false },
      },
    },
  };

  const statusCounts = {
    pending: dashboard.recentOrders.filter((o) => o.status === 'pending').length,
    paid: dashboard.recentOrders.filter((o) => o.status === 'paid').length,
    shipped: dashboard.recentOrders.filter((o) => o.status === 'shipped').length,
    delivered: dashboard.recentOrders.filter((o) => o.status === 'delivered').length,
    cancelled: dashboard.recentOrders.filter((o) => o.status === 'cancelled').length,
  };

  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Resumen de tu tienda este mes</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos del mes', value: formatCLP(dashboard.totalRevenue), change: '+12.5%', icon: DollarSign, color: 'primary' },
          { label: 'Pedidos totales', value: dashboard.totalOrders, change: '+8.2%', icon: ShoppingCart, color: 'secondary' },
          { label: 'Ticket promedio', value: formatCLP(dashboard.averageTicket), change: '+2.1%', icon: TrendingUp, color: 'success' },
          { label: 'Tasa de conversión', value: `${dashboard.conversionRate}%`, change: '+0.8%', icon: Activity, color: 'warning' },
        ].map((metric, idx) => (
          <Card key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-${metric.color}/10 text-${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-green-500">{metric.change}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico + Pedidos por estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Ventas diarias</h3>
            <p className="text-sm text-muted-foreground mb-4">Última semana</p>
            <Bar data={dailyChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pedidos por estado</h3>
            <p className="text-sm text-muted-foreground mb-6">Este mes</p>
            <div className="space-y-3">
              {[
                { label: 'Pendientes', count: statusCounts.pending, color: 'bg-yellow-500' },
                { label: 'Pagados', count: statusCounts.paid, color: 'bg-green-500' },
                { label: 'Enviados', count: statusCounts.shipped, color: 'bg-blue-500' },
                { label: 'Entregados', count: statusCounts.delivered, color: 'bg-primary' },
                { label: 'Cancelados', count: statusCounts.cancelled, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.count}</span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total pedidos</span>
                <span className="text-sm font-bold text-primary">{totalOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos pedidos */}
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Últimos pedidos</h3>
            <p className="text-sm text-muted-foreground">Pedidos más recientes</p>
          </div>
          <Button variant="ghost" className="text-sm" onClick={() => navigate('/admin/orders')}>
            Ver todos <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Pedido</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Cliente</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Total</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Fecha</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dashboard.recentOrders.slice(0, 5).map((order) => (
                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-primary">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {order.user?.email?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.user?.displayName || 'Cliente'}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    {formatCLP(order.total)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant={statusVariant[order.status] || 'outline'}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => navigate(`/admin/orders?expand=${order._id}`)}
                    >
                      Detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/admin/products/new')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Agregar producto</p>
              <p className="text-sm text-muted-foreground">Nuevo producto al catálogo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/admin/coupons')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Tag className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Crear cupón</p>
              <p className="text-sm text-muted-foreground">Nueva promoción</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/admin/stats')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <BarChart3 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Ver reportes</p>
              <p className="text-sm text-muted-foreground">Estadísticas detalladas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;