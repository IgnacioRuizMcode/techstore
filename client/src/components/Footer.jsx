import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Truck, ShieldCheck, CreditCard, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">Suscríbete a nuestro newsletter</h3>
              <p className="text-muted-foreground text-sm">Recibe ofertas exclusivas y las últimas novedades en tecnología</p>
            </div>
            <div className="flex w-full lg:w-auto gap-2">
              <Input type="email" placeholder="tu@email.com" className="flex-1 lg:w-64" />
              <Button>Suscribirse</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Columnas principales */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💻</span>
              <span className="text-xl font-bold text-foreground">
                Tech<span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Tu tienda de tecnología de confianza en Chile. Productos de calidad con garantía y soporte dedicado.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-all">f</a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-all">📷</a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-all">𝕏</a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-all">▶</a>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categorías</h4>
            <ul className="space-y-3">
              <li><Link to="/products?category=Notebooks" className="text-sm text-muted-foreground hover:text-primary transition-colors">Notebooks</Link></li>
              <li><Link to="/products?category=Smartphones" className="text-sm text-muted-foreground hover:text-primary transition-colors">Smartphones</Link></li>
              <li><Link to="/products?category=Gaming" className="text-sm text-muted-foreground hover:text-primary transition-colors">Gaming</Link></li>
              <li><Link to="/products?category=Componentes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Componentes</Link></li>
              <li><Link to="/products?category=Audio" className="text-sm text-muted-foreground hover:text-primary transition-colors">Audio</Link></li>
              <li><Link to="/products?category=Accesorios" className="text-sm text-muted-foreground hover:text-primary transition-colors">Accesorios</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Ayuda</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Centro de ayuda</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Seguimiento de pedido</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Devoluciones</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Garantía</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Preguntas frecuentes</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Política de privacidad</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Política de cookies</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Ley del consumidor</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Av. Providencia 1234, Santiago, Chile</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">+56 2 2345 6789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">contacto@techstore.cl</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Badges de confianza */}
        <Separator className="my-8" />
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5 text-primary" />
            <span className="text-sm">Envío a todo Chile</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm">Compra 100% segura</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm">Pago con Webpay</span>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <span className="px-4 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">Visa</span>
          <span className="px-4 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">Mastercard</span>
          <span className="px-4 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">Webpay</span>
          <span className="px-4 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">Transferencia</span>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">© 2026 TechStore Chile. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;