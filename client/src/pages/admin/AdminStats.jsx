import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCLP } from '../../utils/format';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  ArrowUpRight,
  Users,
  Loader2,
} from 'lucide-react';

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        params.month = month;
        params.year = year;
      }
      const res = await api.get('/orders/stats', { params });
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedMonth]);

  const getMonthOptions = () => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value, label: d.toLocaleString('es-CL', { month: 'long', year: 'numeric' }) });
    }
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando estadísticas...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No se pudieron cargar las estadísticas.</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Ingresos hoy', value: stats.today.revenue, icon: DollarSign, color: 'primary' },
    { label: 'Pedidos hoy', value: stats.today.orders, icon: ShoppingCart, color: 'secondary' },
    { label: 'Ingresos esta semana', value: stats.week.revenue, icon: TrendingUp, color: 'success' },
    { label: 'Ingresos este mes', value: stats.month.revenue, icon: Calendar, color: 'warning' },
  ];

  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
  };

  const monthlyData = stats.monthlySales || [];
  const maxMonthlySales = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.sales)) : 1;

  const statusBars = Object.entries(stats.byStatus).map(([status, count]) => {
    const total = Object.values(stats.byStatus).reduce((a, b) => a + b, 0);
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { status: statusLabels[status] || status, count, percentage };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>
          <p className="text-muted-foreground">Análisis detallado de tu tienda</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Mes actual</option>
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:border-border/80 transition-all animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${colorClasses[metric.color]}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-500">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metric.label.includes('Ingresos') ? formatCLP(metric.value) : metric.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Ventas mensuales</h2>
                <p className="text-sm text-muted-foreground">Tendencia de los últimos 5 meses</p>
              </div>
            </div>
            {monthlyData.length > 0 ? (
              <div className="h-64 flex items-end justify-between gap-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatCLP(data.sales).replace('$', '').replace('.000', 'K')}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all hover:opacity-80 ${
                        index === monthlyData.length - 1 ? 'bg-gradient-to-t from-primary to-secondary' : 'bg-muted'
                      }`}
                      style={{ height: `${(data.sales / maxMonthlySales) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">Sin datos de ventas para este período</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Pedidos por estado</h2>
              <p className="text-sm text-muted-foreground">Distribución actual</p>
            </div>
            <div className="space-y-4">
              {statusBars.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground font-medium capitalize">{item.status}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.count} pedidos</span>
                      <span className="text-foreground font-medium w-12 text-right">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total de pedidos</span>
                  <span className="text-lg font-bold text-foreground">{Object.values(stats.byStatus).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Productos más vendidos</h2>
          <p className="text-sm text-muted-foreground">Top {stats.topProducts.length} del período</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">#</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Producto</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Unidades</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/10 text-yellow-500' : index === 1 ? 'bg-muted text-muted-foreground' : index === 2 ? 'bg-orange-500/10 text-orange-500' : 'bg-muted text-muted-foreground'
                    }`}>{index + 1}</span>
                  </td>
                  <td className="px-6 py-4"><span className="font-medium text-foreground">{product.name}</span></td>
                  <td className="px-6 py-4 text-right"><span className="text-foreground">{product.quantity} uds.</span></td>
                  <td className="px-6 py-4 text-right"><span className="font-semibold text-foreground">{formatCLP(product.revenue || 0)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-green-500/10 rounded-lg"><TrendingUp className="h-4 w-4 text-green-500" /></div><span className="text-sm text-muted-foreground">Mejor día</span></div>
            <p className="text-xl font-bold text-foreground">Sábado 18</p>
            <p className="text-sm text-muted-foreground mt-1">{formatCLP(5890000)} en ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-primary/10 rounded-lg"><ShoppingCart className="h-4 w-4 text-primary" /></div><span className="text-sm text-muted-foreground">Ticket promedio</span></div>
            <p className="text-xl font-bold text-foreground">{formatCLP(stats.month.revenue / (stats.month.orders || 1))}</p>
            <p className="text-sm text-green-500 mt-1">+8% vs. mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-secondary/10 rounded-lg"><Users className="h-4 w-4 text-secondary" /></div><span className="text-sm text-muted-foreground">Tasa de conversión</span></div>
            <p className="text-xl font-bold text-foreground">3.8%</p>
            <p className="text-sm text-green-500 mt-1">+0.6% vs. mes anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;