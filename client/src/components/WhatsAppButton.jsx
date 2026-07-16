import React from 'react';

const WhatsAppButton = ({ phone = '56912345678', message = 'Hola, tengo una consulta sobre un producto' }) => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chatea con nosotros por WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
        <path d="M16 0C7.164 0 0 7.164 0 16c0 2.8 0.7 5.4 2 7.7L0 32l8.5-2.2C10.9 31.1 13.4 32 16 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.3c-2.4 0-4.7-0.6-6.7-1.8l-0.5-0.3-5 1.3 1.3-4.8-0.3-0.5C3.5 21.2 2.7 18.7 2.7 16 2.7 8.7 8.7 2.7 16 2.7S29.3 8.7 29.3 16 23.3 29.3 16 29.3zm7.8-9.8c-0.4-0.2-2.5-1.2-2.9-1.4-0.4-0.1-0.7-0.2-1 0.2-0.3 0.4-1.1 1.4-1.4 1.7-0.3 0.3-0.5 0.3-1 0.1-0.4-0.2-1.8-0.7-3.4-2.1-1.3-1.1-2.1-2.5-2.4-2.9-0.3-0.4 0-0.7 0.2-0.9 0.2-0.2 0.4-0.5 0.6-0.7 0.2-0.2 0.3-0.4 0.4-0.7 0.1-0.3 0.1-0.5-0.1-0.7-0.2-0.2-1-2.4-1.4-3.3-0.4-0.9-0.7-0.8-1-0.8H10c-0.3 0-0.8 0.1-1.2 0.6-0.4 0.5-1.6 1.5-1.6 3.7s1.6 4.3 1.8 4.6c0.2 0.3 3.1 4.8 7.6 6.7 2.8 1.2 3.9 1 5.4 0.6 1.5-0.4 2.5-1.6 2.8-3.1 0.3-1.5 0.3-2.8 0.2-3.1-0.1-0.3-0.4-0.4-0.8-0.6z"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;