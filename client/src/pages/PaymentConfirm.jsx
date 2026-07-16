import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Procesando pago...');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const errorMessage = searchParams.get('message');

    if (statusParam === 'success') {
      setStatus('success');
      setMessage('¡Pago exitoso! Gracias por tu compra.');
      setTimeout(() => {
        navigate(orderId ? `/profile/orders/${orderId}` : '/profile/orders', { replace: true });
      }, 3000);
    } else if (statusParam === 'already_paid') {
      setStatus('success');
      setMessage('Pago ya confirmado anteriormente.');
      setTimeout(() => {
        navigate(orderId ? `/profile/orders/${orderId}` : '/profile/orders', { replace: true });
      }, 2000);
    } else if (statusParam === 'error' || errorMessage) {
      setStatus('error');
      switch (errorMessage) {
        case 'token_missing':
          setMessage('No se recibió el token de pago.');
          break;
        case 'order_not_found':
          setMessage('Pedido no encontrado.');
          break;
        case 'payment_rejected':
          setMessage('El pago fue rechazado. Intenta de nuevo.');
          break;
        default:
          setMessage('Error al confirmar el pago.');
      }
    } else {
      setStatus('error');
      setMessage('No se pudo verificar el pago.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center p-8">
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-center">
            {status === 'processing' && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {status === 'processing' && 'Procesando pago'}
            {status === 'success' && '¡Pago exitoso!'}
            {status === 'error' && 'Error en el pago'}
          </h2>
          <p className="text-muted-foreground">{message}</p>
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">Serás redirigido a tu historial de pedidos...</p>
          )}
          {status === 'error' && (
            <Button className="mt-4" onClick={() => navigate('/checkout')}>
              Volver al checkout
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirm;