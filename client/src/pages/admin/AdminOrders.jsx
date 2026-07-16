import React, { useEffect, useState, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { formatCLP } from '../../utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Filter, ChevronLeft, ChevronRight, Clock, CheckCircle,
  Truck, XCircle, Package, Download, Eye, Loader2, MapPin, RotateCw,
} from 'lucide-react';

const COMPANIES = [
  { value: 'starken', label: 'Starken' },
  { value: 'chilexpress', label: 'Chilexpress' },
  { value: 'correos_chile', label: 'Correos Chile' },
  { value: 'bluexpress', label: 'Bluexpress' },
  { value: 'pullman', label: 'Pullman Cargo' },
  { value: 'other', label: 'Otra empresa' },
];

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'outline', icon: Clock },
  paid: { label: 'Pagado', variant: 'default', icon: CheckCircle },
  preparing: { label: 'Preparando', variant: 'secondary', icon: Package },
  shipped: { label: 'Enviado', variant: 'default', icon: Truck },
  out_for_delivery: { label: 'En reparto', variant: 'secondary', icon: Truck },
  delivered: { label: 'Entregado', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
};

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const expandParam = searchParams.get('expand');

  const [orders, setOrders] = useState([]);           // pedidos filtrados (para la tabla)
  const [allOrders, setAllOrders] = useState([]);     // todos los pedidos (para los contadores)
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(expandParam || null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('starken');
  const [trackingLocation, setTrackingLocation] = useState('');
  const [trackingDescription, setTrackingDescription] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Obtener TODOS los pedidos (para contadores)
  const fetchAllOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setAllOrders(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Obtener pedidos filtrados (para tabla)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minTotal) params.minTotal = minTotal;
      if (maxTotal) params.maxTotal = maxTotal;
      if (customerEmail) params.customerEmail = customerEmail;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/orders/all', { params });
      setOrders(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();       // cargar todos los pedidos una sola vez
  }, []);

  useEffect(() => {
    fetchOrders();          // recargar tabla cuando cambien los filtros
  }, [statusFilter, startDate, endDate, minTotal, maxTotal, customerEmail]);

  useEffect(() => {
    let result = orders;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.user?.email?.toLowerCase().includes(s) ||
          o._id.includes(s) ||
          o.user?.displayName?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, orders]);

  useEffect(() => {
    if (expandParam) setExpandedOrder(expandParam);
  }, [expandParam]);

  // Contadores basados en ALL orders (sin filtrar)
  const statusCounts = {
    all: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    paid: allOrders.filter(o => o.status === 'paid').length,
    preparing: allOrders.filter(o => o.status === 'preparing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    out_for_delivery: allOrders.filter(o => o.status === 'out_for_delivery').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
  };

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const changeStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    fetchOrders();
    fetchAllOrders();
  };

  const markAsShipped = async (orderId) => {
    if (!trackingNumber.trim()) {
      alert('Ingresa tracking');
      return;
    }
    await api.post(`/orders/${orderId}/ship`, {
      trackingNumber,
      trackingCompany,
      location: trackingLocation,
    });
    setTrackingNumber('');
    setTrackingCompany('starken');
    setTrackingLocation('');
    fetchOrders();
    fetchAllOrders();
    setExpandedOrder(null);
  };

  const addTrackingUpdate = async (orderId) => {
    if (!trackingDescription.trim()) {
      alert('Ingresa descripción');
      return;
    }
    await api.post(`/orders/${orderId}/tracking`, {
      description: trackingDescription,
      location: trackingLocation,
    });
    setTrackingDescription('');
    setTrackingLocation('');
    fetchOrders();
    setExpandedOrder(null);
  };

  const addNote = async (orderId) => {
    if (!internalNote.trim()) return;
    await api.patch(`/orders/${orderId}/note`, { note: internalNote });
    setInternalNote('');
    fetchOrders();
    setExpandedOrder(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Cliente', 'Total', 'Estado', 'Fecha'];
    const rows = filtered.map(o => [
      o._id,
      o.user?.email || 'N/A',
      o.total,
      o.status,
      new Date(o.createdAt).toLocaleDateString('es-CL'),
    ]);
    const csv = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pedidos_${Date.now()}.csv`;
    a.click();
  };

  const exportPDF = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/orders/report/pdf', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${Date.now()}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de la tienda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" /> CSV</Button>
          <Button variant="outline" onClick={exportPDF}><Download className="h-4 w-4 mr-2" /> PDF</Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="text" placeholder="Buscar por ID o cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />{showAdvanced ? 'Ocultar filtros' : 'Más filtros'}
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-card border border-border rounded-xl">
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Fecha inicio" />
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="Fecha fin" />
          <Input type="number" placeholder="Total mínimo" value={minTotal} onChange={e => setMinTotal(e.target.value)} />
          <Input type="number" placeholder="Total máximo" value={maxTotal} onChange={e => setMaxTotal(e.target.value)} />
          <Input type="text" placeholder="Email del cliente" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
        </div>
      )}

      {/* Tabs de estado */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: '', label: 'Todos', count: statusCounts.all },
          { value: 'pending', label: 'Pendientes', count: statusCounts.pending },
          { value: 'paid', label: 'Pagados', count: statusCounts.paid },
          { value: 'preparing', label: 'Preparando', count: statusCounts.preparing },
          { value: 'shipped', label: 'Enviados', count: statusCounts.shipped },
          { value: 'out_for_delivery', label: 'En reparto', count: statusCounts.out_for_delivery },
          { value: 'delivered', label: 'Entregados', count: statusCounts.delivered },
          { value: 'cancelled', label: 'Cancelados', count: statusCounts.cancelled },
        ].map(tab => (
          <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}>
            {tab.label}
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${statusFilter === tab.value ? 'bg-primary-foreground/20' : 'bg-border'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando pedidos...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Pedido</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Cliente</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Total</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Estado</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Fecha</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedOrders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron pedidos.</td></tr>
                  ) : (
                    paginatedOrders.map(order => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const isExpanded = expandedOrder === order._id;
                      return (
                        <Fragment key={order._id}>
                          <tr
                            className={`hover:bg-muted/30 transition-colors cursor-pointer ${isExpanded ? 'bg-muted/30' : ''}`}
                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                <span className="font-mono font-semibold text-primary">#{order._id.slice(-8)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-foreground">{order.user?.displayName || 'Cliente'}</p>
                                <p className="text-xs text-muted-foreground">{order.user?.email || ''}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="font-medium text-foreground">{formatCLP(order.total)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={status.variant} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border">
                                <StatusIcon className="h-3 w-3" />{status.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="text-primary" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-muted/20">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> Productos</h4>
                                    <div className="space-y-2">
                                      {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">{item.name} <span className="text-foreground">x{item.quantity}</span></span>
                                          <span className="text-foreground">{formatCLP((item.totalPrice || item.netPrice) * item.quantity)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Entrega</h4>
                                    <p className="text-sm text-muted-foreground">{order.deliveryMethod === 'pickup' ? 'Retiro en tienda' : order.shippingAddress || 'Sin dirección'}</p>
                                    {order.trackingCompany && <p className="text-sm mt-1"><strong>Empresa:</strong> {COMPANIES.find(c => c.value === order.trackingCompany)?.label || order.trackingCompany}</p>}
                                    {order.trackingNumber && <p className="text-sm"><strong>Tracking:</strong> {order.trackingNumber}</p>}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><RotateCw className="h-4 w-4" /> Gestionar</h4>
                                    <select value={order.status} onChange={e => changeStatus(order._id, e.target.value)}
                                      className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3">
                                      {Object.keys(statusConfig).map(key => (<option key={key} value={key}>{statusConfig[key].label}</option>))}
                                    </select>
                                    {order.status === 'preparing' && (
                                      <div className="space-y-2 border-t border-border pt-3">
                                        <p className="text-xs text-muted-foreground">Marcar como enviado</p>
                                        <select value={trackingCompany} onChange={e => setTrackingCompany(e.target.value)}
                                          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                                          {COMPANIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
                                        </select>
                                        <Input type="text" placeholder="Nº de tracking *" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                                        <Input type="text" placeholder="Ubicación (opcional)" value={trackingLocation} onChange={e => setTrackingLocation(e.target.value)} />
                                        <Button size="sm" className="w-full" onClick={() => markAsShipped(order._id)}>Confirmar envío</Button>
                                      </div>
                                    )}
                                    {(order.status === 'shipped' || order.status === 'out_for_delivery') && (
                                      <div className="space-y-2 border-t border-border pt-3">
                                        <p className="text-xs text-muted-foreground">Actualizar seguimiento</p>
                                        <Input type="text" placeholder="Descripción (ej: En reparto)" value={trackingDescription} onChange={e => setTrackingDescription(e.target.value)} />
                                        <Input type="text" placeholder="Ubicación (opcional)" value={trackingLocation} onChange={e => setTrackingLocation(e.target.value)} />
                                        <Button size="sm" className="w-full" onClick={() => addTrackingUpdate(order._id)}>Notificar cliente</Button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {order.trackingHistory?.length > 0 && (
                                  <div className="mt-6 pt-4 border-t border-border">
                                    <h4 className="text-sm font-semibold text-foreground mb-3">Historial de estados</h4>
                                    <div className="space-y-2">
                                      {order.trackingHistory.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm">
                                          <div className="flex flex-col items-center">
                                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                                            {idx < order.trackingHistory.length - 1 && <div className="w-0.5 h-full bg-border" />}
                                          </div>
                                          <div>
                                            <p className="text-foreground">{step.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(step.date).toLocaleString('es-CL')}
                                              {step.location && ` — ${step.location}`}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-6 pt-4 border-t border-border">
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Nota interna</h4>
                                  {order.note ? <p className="text-sm text-muted-foreground mb-2">{order.note}</p> : <p className="text-sm text-muted-foreground mb-2">Sin notas</p>}
                                  <div className="flex gap-2">
                                    <Input type="text" placeholder="Agregar nota..." value={internalNote} onChange={e => setInternalNote(e.target.value)} />
                                    <Button size="sm" onClick={() => addNote(order._id)}>Guardar</Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length} pedidos</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><ChevronLeft className="h-5 w-5" /></Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentPage(pageNum)}>{pageNum}</Button>;
                  })}
                  <Button variant="ghost" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><ChevronRight className="h-5 w-5" /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;