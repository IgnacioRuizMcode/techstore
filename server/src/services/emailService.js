const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Confirmación de compra
exports.sendPurchaseConfirmation = async (to, order) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const itemsHtml = order.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.quantity}</td>
      <td>$${(i.totalPrice || 0).toLocaleString('es-CL')}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Pedido #${orderId} confirmado`,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Pedido <strong>#${orderId}</strong></p>
      <table border="1" cellpadding="5">
        <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Subtotal:</strong> $${(order.subtotal || 0).toLocaleString('es-CL')}</p>
      <p><strong>IVA (19%):</strong> $${(order.ivaTotal || 0).toLocaleString('es-CL')}</p>
      <p><strong>Total:</strong> $${(order.total || 0).toLocaleString('es-CL')}</p>
      <p>Te notificaremos cuando sea enviado.</p>
    `,
  });
};

// Envío de pedido
exports.sendShippingNotification = async (to, order, company) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const trackingInfo = company.url
    ? `<p><strong>Empresa:</strong> ${company.name}</p>
       <p><strong>Tracking:</strong> ${order.trackingNumber}</p>
       <p><a href="${company.url}" target="_blank">👉 Hacer seguimiento</a></p>`
    : `<p><strong>Empresa:</strong> ${company.name}</p><p><strong>Guía:</strong> ${order.trackingNumber}</p>`;

  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🚚 Pedido #${orderId} enviado`,
    html: `<h1>¡Tu pedido va en camino!</h1><p>Pedido <strong>#${orderId}</strong></p>${trackingInfo}`,
  });
};

// Actualización de tracking
exports.sendTrackingUpdate = async (to, order, description) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: `📦 Actualización pedido #${orderId}`,
    html: `<h1>Actualización de tu pedido</h1><p><strong>Pedido:</strong> #${orderId}</p><p>${description}</p>`,
  });
};

// Verificación de email
exports.sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Verifica tu cuenta en TechStore',
    html: `
      <h1>Bienvenido a TechStore</h1>
      <p>Haz clic en el botón para verificar tu cuenta:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;">Verificar email</a>
      <p>Este enlace expira en 24 horas.</p>
    `,
  });
};

// Recuperación de contraseña
exports.sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔒 Restablece tu contraseña',
    html: `
      <h1>Recuperación de contraseña</h1>
      <p>Haz clic en el botón para restablecer tu contraseña:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;">Restablecer contraseña</a>
      <p>Este enlace expira en 1 hora.</p>
    `,
  });
};

exports.sendStockNotification = async (to, productName, productUrl) => {
  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: `📦 ${productName} vuelve a estar disponible`,
    html: `
      <h1>¡Buenas noticias!</h1>
      <p>El producto <strong>${productName}</strong> que solicitaste ya está disponible.</p>
      <a href="${productUrl}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;">Ver producto</a>
    `,
  });
};