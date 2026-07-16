import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  KeyRound,
  Mail,
  Loader2,
  Zap,
  ArrowLeft,
  CheckCircle,
  Lock,
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  // Estado de éxito
  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="relative overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/20 blur-3xl rounded-full -z-10" />
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <CardTitle>Correo enviado</CardTitle>
              <CardDescription>
                Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y sigue las instrucciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/login">
                <Button className="w-full">Volver a Iniciar Sesión</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                Reenviar correo
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                ¿No recibiste el correo? Revisa tu carpeta de spam o intenta con otro email.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Enlace para volver */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>

        {/* Tarjeta principal */}
        <Card className="relative overflow-hidden">
          {/* Efecto de glow decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full -z-10" />

          <CardHeader className="text-center">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Tech<span className="text-primary">Store</span>
              </span>
            </Link>

            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
            </div>
            <CardDescription>
              Ingresa tu email y te enviaremos un enlace para restablecerla
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  <Lock className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    id="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Te enviaremos un enlace para crear una nueva contraseña
                </p>
              </div>

              {/* Botón submit */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar enlace
                  </>
                )}
              </Button>
            </form>

            {/* Link a login */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Volver al inicio de sesión
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Badge de seguridad */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Conexión segura SSL</span>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;