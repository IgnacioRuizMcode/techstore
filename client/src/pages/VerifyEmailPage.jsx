import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verificado correctamente.');
      })
      .catch(() => {
        setStatus('success');
        setMessage('El email ya fue verificado anteriormente o el enlace expiró. Si ya verificaste tu cuenta, puedes iniciar sesión.');
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="flex justify-center mb-4">
          {status === 'loading' ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">
          {status === 'loading' ? 'Verificando...' : 'Verificación'}
        </h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button asChild className="w-full">
          <Link to="/login">Iniciar sesión</Link>
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;