import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton phone="56912345678" message="Hola, necesito ayuda con un producto" />
    </div>
  );
};

export default Layout;