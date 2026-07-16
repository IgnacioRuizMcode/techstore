const PDFDocument = require('pdfkit');

exports.generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const COMPANY_NAME = 'TechStore Chile';
    const COMPANY_RUT = '76.123.456-7';
    const COMPANY_ADDRESS = 'Av. Providencia 1234, Santiago, Chile';
    const COMPANY_EMAIL = 'contacto@techstore.cl';
    const COMPANY_PHONE = '+56 2 2345 6789';

    // ─── ENCABEZADO ──────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill('#1e293b'); // Fondo oscuro
    doc.fill('#ffffff').fontSize(24).text(COMPANY_NAME, 50, 30);
    doc.fontSize(10).text('BOLETA DE VENTA ELECTRÓNICA', 50, 60);
    doc.fontSize(8).text(`RUT: ${COMPANY_RUT}`, 50, 78);
    doc.text(COMPANY_ADDRESS, 50, 90);
    doc.text(`Email: ${COMPANY_EMAIL}  •  Tel: ${COMPANY_PHONE}`, 50, 102);

    // ─── NÚMERO DE PEDIDO (destacado) ──────
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    doc.rect(doc.page.width - 200, 20, 170, 70).fill('#334155');
    doc.fill('#ffffff').fontSize(16).text('PEDIDO', doc.page.width - 185, 30);
    doc.fontSize(20).text(`#${orderIdShort}`, doc.page.width - 185, 50);

    // ─── DATOS DEL CLIENTE ──────────────────
    doc.moveDown(2);
    doc.fill('#000000').fontSize(10).text('DATOS DEL CLIENTE', 50, 140);
    doc.moveDown(0.5);
    doc.fontSize(9).text(`Nombre: ${user.displayName || 'Cliente'}`);
    doc.text(`Email: ${user.email}`);
    if (order.shippingAddress) {
      doc.text(`Dirección de envío: ${order.shippingAddress}`);
    }
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-CL', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Fecha de compra: ${orderDate}`);
    doc.text(`Método de entrega: ${order.deliveryMethod === 'pickup' ? 'Retiro en tienda' : 'Envío a domicilio'}`);

    // ─── TABLA DE PRODUCTOS ─────────────────
    doc.moveDown(1);
    const tableTop = doc.y;
    // Encabezados de tabla
    doc.rect(50, tableTop, 500, 20).fill('#1e293b');
    doc.fill('#ffffff').fontSize(9);
    doc.text('Producto', 60, tableTop + 5);
    doc.text('Cant.', 280, tableTop + 5, { width: 40, align: 'center' });
    doc.text('Precio Unit.', 340, tableTop + 5, { width: 70, align: 'right' });
    doc.text('Subtotal', 460, tableTop + 5, { width: 80, align: 'right' });

    let y = tableTop + 25;
    doc.fill('#000000').fontSize(9);
    order.items.forEach((item, idx) => {
      const unitPrice = item.totalPrice || item.netPrice || 0;
      const lineTotal = unitPrice * item.quantity;
      // Fondo alterno para filas
      if (idx % 2 === 0) {
        doc.rect(50, y - 2, 500, 18).fill('#f8fafc');
      }
      doc.fill('#000000');
      doc.text(item.name, 60, y, { width: 200 });
      doc.text(item.quantity.toString(), 280, y, { width: 40, align: 'center' });
      doc.text(`$${unitPrice.toLocaleString('es-CL')}`, 340, y, { width: 70, align: 'right' });
      doc.text(`$${lineTotal.toLocaleString('es-CL')}`, 460, y, { width: 80, align: 'right' });
      y += 20;
    });

    // ─── TOTALES ────────────────────────────
    y += 10;
    doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
    y += 10;
    const rightColX = 350;
    doc.fontSize(10).text('Subtotal (neto):', rightColX, y);
    doc.text(`$${order.subtotal.toLocaleString('es-CL')}`, 460, y, { width: 90, align: 'right' });
    y += 20;
    doc.text('IVA (19%):', rightColX, y);
    doc.text(`$${order.ivaTotal.toLocaleString('es-CL')}`, 460, y, { width: 90, align: 'right' });
    y += 20;
    doc.text('Costo de envío:', rightColX, y);
    doc.text('Gratis', 460, y, { width: 90, align: 'right' });
    y += 20;
    doc.moveTo(300, y).lineTo(550, y).strokeColor('#1e293b').stroke();
    y += 10;
    doc.fontSize(14).font('Helvetica-Bold').text('TOTAL:', rightColX, y);
    doc.text(`$${order.total.toLocaleString('es-CL')}`, 460, y, { width: 90, align: 'right' });

    // ─── PIE DE PÁGINA ─────────────────────
    doc.fontSize(8).fill('#64748b').font('Helvetica');
    doc.text('Método de pago: Webpay Plus (Transbank)', 50, 720, { align: 'center' });
    doc.text(`ID de transacción: ${order._id.toString()}`, 50, 735, { align: 'center' });
    doc.text('Este documento no es una factura oficial. Sirve como comprobante de compra.', 50, 760, { align: 'center' });

    doc.end();
  });
};