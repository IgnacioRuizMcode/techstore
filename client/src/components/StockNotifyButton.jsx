import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const StockNotifyButton = ({ productId, outOfStock }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post(`/products/${productId}/notify-stock`, { email });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert('Error al registrar la notificación');
    } finally {
      setLoading(false);
    }
  };

  if (!outOfStock) return null;

  return (
    <div className="mt-3">
      {sent ? (
        <p className="text-green-500 text-sm">✅ Te avisaremos cuando vuelva el stock</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? '...' : 'Avísame'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default StockNotifyButton;