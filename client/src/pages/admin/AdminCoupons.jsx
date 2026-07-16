import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price);

const CouponStatusBadge = ({ status }) => {
  const config = {
    active: { label: 'Activo', variant: 'default', icon: CheckCircle },
    expired: { label: 'Expirado', variant: 'outline', icon: Clock },
    exhausted: { label: 'Agotado', variant: 'secondary', icon: AlertCircle },
    inactive: { label: 'Inactivo', variant: 'destructive', icon: XCircle },
  };
  const cfg = config[status] || config.inactive;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'fixed',
    discountValue: '',
    minPurchase: '',
    maxUses: '',
    expiresAt: '',
    active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setForm({ code: '', discountType: 'fixed', discountValue: '', minPurchase: '', maxUses: '', expiresAt: '', active: true });
    setErrors({});
    setEditingCoupon(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Requerido';
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) errs.discountValue = 'Debe ser mayor a 0';
    if (form.discountType === 'percentage' && parseFloat(form.discountValue) > 100) errs.discountValue = 'Máximo 100%';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
        expiresAt: form.expiresAt || undefined,
      };
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon}`, payload);
      } else {
        await api.post('/coupons', payload);
      }
      fetchCoupons();
      resetForm();
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minPurchase: coupon.minPurchase ? String(coupon.minPurchase) : '',
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      active: coupon.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este cupón?')) {
      try {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.active) return 'inactive';
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'expired';
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return 'exhausted';
    return 'active';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cupones</h1>
          <p className="text-muted-foreground">Gestiona los códigos de descuento</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-all"
        >
          <Plus className="h-5 w-5" />
          {showForm ? 'Cancelar' : (editingCoupon ? 'Editar cupón' : 'Crear cupón')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showForm && (
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{editingCoupon ? 'Editar cupón' : 'Nuevo cupón'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Código del cupón</label>
                  <input type="text" name="code" placeholder="DESCUENTO10" value={form.code} onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground uppercase focus:outline-none focus:ring-2 focus:ring-primary ${errors.code ? 'border-destructive' : 'border-border'}`} />
                  {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tipo de descuento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setForm({ ...form, discountType: 'fixed' })}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${form.discountType === 'fixed' ? 'bg-primary/10 border-2 border-primary text-primary' : 'bg-muted border border-border text-muted-foreground hover:bg-muted/80'}`}>
                      <DollarSign className="h-4 w-4" /> Monto fijo
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, discountType: 'percentage' })}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${form.discountType === 'percentage' ? 'bg-primary/10 border-2 border-primary text-primary' : 'bg-muted border border-border text-muted-foreground hover:bg-muted/80'}`}>
                      <Percent className="h-4 w-4" /> Porcentaje
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Valor del descuento</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{form.discountType === 'fixed' ? '$' : '%'}</span>
                    <input type="number" name="discountValue" placeholder={form.discountType === 'percentage' ? '20' : '5000'} value={form.discountValue} onChange={handleChange}
                      className={`w-full pl-8 pr-4 py-2.5 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.discountValue ? 'border-destructive' : 'border-border'}`} />
                  </div>
                  {errors.discountValue && <p className="text-xs text-destructive mt-1">{errors.discountValue}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Compra mínima (opcional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input type="number" name="minPurchase" placeholder="49990" value={form.minPurchase} onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Límite de usos (opcional)</label>
                  <input type="number" name="maxUses" placeholder="500" value={form.maxUses} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Fecha de expiración (opcional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange}
                    className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary" />
                  <label htmlFor="active" className="text-sm text-foreground">Activo</label>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>) : (editingCoupon ? 'Actualizar cupón' : 'Crear cupón')}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-xl bg-muted" /><div className="space-y-2"><div className="h-5 w-24 bg-muted rounded" /><div className="h-4 w-32 bg-muted rounded" /></div></div>
                  <div className="h-2 w-full bg-muted rounded-full" />
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay cupones creados</h3>
              <p className="text-muted-foreground">Crea tu primer cupón para empezar a ofrecer descuentos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon, index) => {
                const status = getCouponStatus(coupon);
                return (
                  <div key={coupon._id} className="bg-card border border-border rounded-2xl p-5 hover:border-border/80 transition-all animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Tag className={`h-6 w-6 ${status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold text-foreground">{coupon.code}</span>
                            <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" title="Copiar código" onClick={() => navigator.clipboard.writeText(coupon.code)}>
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {coupon.discountType === 'fixed' ? formatPrice(coupon.discountValue) + ' de descuento' : coupon.discountValue + '% de descuento'}
                            {coupon.minPurchase > 0 && ` en compras sobre ${formatPrice(coupon.minPurchase)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CouponStatusBadge status={status} />
                        <div className="flex items-center gap-1">
                          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Editar" onClick={() => handleEdit(coupon)}>
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Eliminar" onClick={() => handleDelete(coupon._id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
                      <div><p className="text-xs text-muted-foreground">Usos</p><p className="text-sm font-medium text-foreground">{coupon.usedCount || 0}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}</p></div>
                      {coupon.maxUses && (<div><p className="text-xs text-muted-foreground">Disponibles</p><p className="text-sm font-medium text-foreground">{Math.max(0, coupon.maxUses - (coupon.usedCount || 0))}</p></div>)}
                      <div><p className="text-xs text-muted-foreground">Expira</p><p className="text-sm font-medium text-foreground">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('es-CL') : 'Sin fecha'}</p></div>
                    </div>
                    {coupon.maxUses && (
                      <div className="mt-3">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${coupon.usedCount >= coupon.maxUses ? 'bg-warning' : 'bg-gradient-to-r from-primary to-secondary'}`}
                            style={{ width: `${Math.min(100, ((coupon.usedCount || 0) / coupon.maxUses) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;