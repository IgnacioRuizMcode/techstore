const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const emailService = require('../services/emailService');
const User = require('../models/User');
const { IVA_RATE } = require('../config/constants');
const invoiceService = require('../services/invoiceService');
const PDFDocument = require('pdfkit');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const trackingService = require('../services/trackingService');
const transbankService = require('../services/transbankService');

// ─── Función auxiliar: notificar a todos los administradores ───
const notifyAdmins = async (title, message, link) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superadmin'] },
    }).select('_id');
    const notifications = admins.map((admin) => ({
      user: admin._id,
      type: 'order_update',
      title,
      message,
      link,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Error notificando a admins:', err);
  }
};

// ══════════════════════════════════════════════════════════════
// CREAR ORDEN CON TRANSBANK REAL
// ══════════════════════════════════════════════════════════════
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Carrito vacío' });
    }

    let subtotal = 0;
    let ivaTotal = 0;
    const items = cart.items.map((item) => {
      const price = item.price || item.product.basePrice;
      const netPrice = Math.round(price / (1 + IVA_RATE));
      const iva = price - netPrice;
      subtotal += netPrice * item.quantity;
      ivaTotal += iva * item.quantity;
      return {
        product: item.product._id,
        name: item.product.name,
        netPrice,
        iva,
        totalPrice: price,
        quantity: item.quantity,
        variantId: item.variantId,
      };
    });

    const total = Math.round(subtotal + ivaTotal);

    // Crear orden en base de datos (sin token todavía)
    const order = new Order({
      user: req.user._id,
      items,
      subtotal,
      ivaTotal,
      total,
      shippingAddress: req.body.shippingAddress || '',
      deliveryMethod: req.body.deliveryMethod || 'shipping',
      status: 'pending',
      trackingHistory: [
        {
          status: 'pending',
          description: 'Pedido creado',
          date: new Date(),
        },
      ],
    });
    await order.save();

    // Registrar uso de cupón si se aplicó
    if (req.body.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: req.body.couponCode.toUpperCase() },
        {
          $inc: { usedCount: 1 },
          $push: {
            usedBy: {
              userId: req.user._id.toString(),
              usedAt: new Date(),
            },
          },
        }
      );
    }

    // Crear transacción en Transbank
    const buyOrder = order._id.toString();
    const sessionId = req.user._id.toString();
    const returnUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/confirm`;

    const transbankResponse = await transbankService.createTransaction(
      buyOrder,
      sessionId,
      total,
      returnUrl
    );

    // Guardar el token de Transbank en la orden
    order.webpayToken = transbankResponse.token;
    await order.save();

    // Responder con la URL de pago real
    res.json({
      success: true,
      url: transbankResponse.url,
      token: transbankResponse.token,
    });
  } catch (err) {
    console.error('Error en createOrder:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════
// CONFIRMAR PAGO (TRANSBANK REDIRIGE AQUÍ)
// ══════════════════════════════════════════════════════════════
exports.confirmPayment = async (req, res) => {
  try {
    const { token_ws } = req.query; // Transbank envía el token como query param

    if (!token_ws) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/confirm?status=error&message=token_missing`
      );
    }

    const order = await Order.findOne({ webpayToken: token_ws });
    if (!order) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/confirm?status=error&message=order_not_found`
      );
    }

    if (order.status === 'preparing' || order.status === 'paid') {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/confirm?status=already_paid&orderId=${order._id}`
      );
    }

    // Confirmar con Transbank
    const confirmed = await transbankService.commitTransaction(token_ws);

    if (confirmed.response_code === 0) {
      // Pago exitoso
      order.status = 'preparing';
      order.trackingHistory.push({
        status: 'preparing',
        description: 'Pago confirmado. Preparando pedido.',
        date: new Date(),
      });
      await order.save();

      // Notificación al cliente
      await Notification.create({
        user: order.user,
        type: 'order_update',
        title: `Pedido #${order._id.toString().slice(-8).toUpperCase()}`,
        message: '¡Pago confirmado! Estamos preparando tu pedido.',
        link: `/profile/orders/${order._id}`,
      });

      // Notificación a administradores
      await notifyAdmins(
        `Nuevo pedido #${order._id.toString().slice(-8).toUpperCase()}`,
        `Pedido por $${order.total.toLocaleString('es-CL')} listo para preparar.`,
        `/admin/orders?expand=${order._id}`
      );

      // Descontar stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(product.stock - item.quantity, 0);
          await product.save();
        }
      }

      // Limpiar carrito
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

      // Enviar correo de confirmación
      try {
        const user = await User.findById(order.user);
        if (user) await emailService.sendPurchaseConfirmation(user.email, order);
      } catch (e) {
        console.error(e);
      }

      // Redirigir al frontend con éxito
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/confirm?status=success&orderId=${order._id}`
      );
    } else {
      // Pago rechazado
      order.status = 'cancelled';
      order.trackingHistory.push({
        status: 'cancelled',
        description: 'Pago rechazado por Transbank.',
        date: new Date(),
      });
      await order.save();
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/confirm?status=error&message=payment_rejected`
      );
    }
  } catch (err) {
    console.error('Error confirmando pago:', err);
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/confirm?status=error&message=server_error`
    );
  }
};

// Marcar como enviado
exports.markAsShipped = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, trackingCompany, location } = req.body;

    const companies = {
      starken: { name: 'Starken', url: 'https://www.starken.cl/seguimiento' },
      chilexpress: {
        name: 'Chilexpress',
        url: 'https://www.chilexpress.cl/seguimiento',
      },
      correos_chile: {
        name: 'Correos Chile',
        url: 'https://www.correos.cl/seguimiento',
      },
      bluexpress: {
        name: 'Bluexpress',
        url: 'https://www.bluexpress.cl/seguimiento',
      },
      pullman: {
        name: 'Pullman Cargo',
        url: 'https://www.pullmancargo.cl/seguimiento',
      },
      other: { name: 'Otra empresa', url: '' },
    };
    const company = companies[trackingCompany] || companies.other;

    const update = {
      status: 'shipped',
      trackingNumber,
      trackingCompany,
      trackingUrl: company.url,
      $push: {
        trackingHistory: {
          status: 'shipped',
          description: `Enviado por ${company.name} — Tracking: ${trackingNumber}`,
          date: new Date(),
          location: location || 'Despachado',
        },
      },
    };

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });

    // ═══ REGISTRAR TRACKING AUTOMÁTICO (SCRAPING) Y GUARDAR EN HISTORIAL ═══
    try {
      const trackingResult = await trackingService.autoTrack(order);
      if (trackingResult?.success) {
        const newStatus = trackingResult.delivered ? 'delivered' : order.status;
        order.trackingHistory.push({
          status: newStatus,
          description: trackingResult.status,
          date: new Date(),
          location: trackingResult.carrier || 'Tracking automático',
        });
        if (newStatus !== order.status) {
          order.status = newStatus;
        }
        await order.save();
        console.log(`📦 Tracking ${trackingNumber} actualizado vía scraping: ${trackingResult.status}`);
        if (newStatus === 'delivered') {
          await Notification.create({
            user: order.user,
            type: 'order_update',
            title: `Pedido #${order._id.toString().slice(-8).toUpperCase()}`,
            message: '¡Tu pedido ha sido entregado!',
            link: `/profile/orders/${order._id}`,
          });
          await notifyAdmins(
            `Pedido #${order._id.toString().slice(-8).toUpperCase()} entregado`,
            'El pedido fue entregado según la empresa de envíos.',
            `/admin/orders?expand=${order._id}`
          );
        }
      } else {
        console.warn(`⚠️ No se pudo obtener tracking automático para ${trackingNumber}`);
      }
    } catch (trackError) {
      console.error('Error en auto track:', trackError);
    }

    // Notificación al cliente
    await Notification.create({
      user: order.user,
      type: 'order_update',
      title: `Pedido #${order._id.toString().slice(-8).toUpperCase()}`,
      message: `Tu pedido ha sido enviado por ${company.name}. Tracking: ${trackingNumber}`,
      link: `/profile/orders/${order._id}`,
    });

    // Notificación a administradores
    await notifyAdmins(
      `Pedido #${order._id.toString().slice(-8).toUpperCase()} enviado`,
      `Enviado por ${company.name}. Tracking: ${trackingNumber}`,
      `/admin/orders?expand=${order._id}`
    );

    try {
      const user = await User.findById(order.user);
      if (user) await emailService.sendShippingNotification(user.email, order, company);
    } catch (e) {
      console.error(e);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Agregar actualización de tracking
exports.addTrackingUpdate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { description, location, status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: status || order.status,
        $push: {
          trackingHistory: {
            status: status || order.status,
            description,
            date: new Date(),
            location,
          },
        },
      },
      { new: true }
    );

    // Notificación al cliente
    await Notification.create({
      user: order.user,
      type: 'order_update',
      title: `Pedido #${order._id.toString().slice(-8).toUpperCase()}`,
      message: description,
      link: `/profile/orders/${order._id}`,
    });

    try {
      const user = await User.findById(order.user);
      if (user) await emailService.sendTrackingUpdate(user.email, order, description);
    } catch (e) {
      console.error(e);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtener pedidos del usuario
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtener todos los pedidos (admin) con filtros
exports.getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate, minTotal, maxTotal, customerEmail, status } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minTotal || maxTotal) {
      filter.total = {};
      if (minTotal) filter.total.$gte = Number(minTotal);
      if (maxTotal) filter.total.$lte = Number(maxTotal);
    }
    if (status) filter.status = status;
    if (customerEmail) {
      const users = await User.find({ email: { $regex: customerEmail, $options: 'i' } });
      const userIds = users.map((u) => u._id);
      filter.user = { $in: userIds };
    }

    const orders = await Order.find(filter)
      .populate('user', 'email displayName')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cambiar estado
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: {
          trackingHistory: {
            status,
            description: `Estado cambiado a ${status}`,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    // Notificación al cliente
    await Notification.create({
      user: order.user,
      type: 'order_update',
      title: `Pedido #${order._id.toString().slice(-8).toUpperCase()}`,
      message: `Tu pedido ahora está: ${status}`,
      link: `/profile/orders/${order._id}`,
    });

    // Notificar a admins si el estado cambia a "preparing"
    if (status === 'preparing') {
      await notifyAdmins(
        `Pedido #${order._id.toString().slice(-8).toUpperCase()} listo para preparar`,
        `Pedido por $${order.total.toLocaleString('es-CL')} listo para preparar.`,
        `/admin/orders?expand=${order._id}`
      );
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Actualizar nota
exports.updateNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { note }, { new: true });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Estadísticas (versión completa con filtro por mes y monthlySales)
exports.getStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateFilter = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter.createdAt = { $gte: start, $lte: end };
    } else {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.createdAt = { $gte: startOfMonth };
    }

    const periodOrders = await Order.find({
      ...dateFilter,
      status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] },
    });

    const totalRevenue = periodOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = periodOrders.length;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const todayOrders = periodOrders.filter((o) => new Date(o.createdAt) >= startOfDay);
    const weekOrders = periodOrders.filter((o) => new Date(o.createdAt) >= startOfWeek);

    const allPeriodOrders = await Order.find(dateFilter);
    const byStatus = {
      pending: allPeriodOrders.filter((o) => o.status === 'pending').length,
      paid: allPeriodOrders.filter((o) => o.status === 'paid').length,
      preparing: allPeriodOrders.filter((o) => o.status === 'preparing').length,
      shipped: allPeriodOrders.filter((o) => o.status === 'shipped').length,
      delivered: allPeriodOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allPeriodOrders.filter((o) => o.status === 'cancelled').length,
    };

    const topProducts = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: {
            $sum: {
              $multiply: [{ $ifNull: ['$items.totalPrice', 0] }, '$items.quantity'],
            },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', quantity: 1, revenue: 1, _id: 0 } },
    ]);

    const monthlySales = [];
    const currentDate = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const mOrders = await Order.find({
        status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] },
        createdAt: { $gte: mStart, $lte: mEnd },
      });
      monthlySales.push({
        month: d.toLocaleString('es-CL', { month: 'short' }),
        sales: mOrders.reduce((s, o) => s + o.total, 0),
      });
    }

    res.json({
      success: true,
      data: {
        today: { orders: todayOrders.length, revenue: todayOrders.reduce((s, o) => s + o.total, 0) },
        week: { orders: weekOrders.length, revenue: weekOrders.reduce((s, o) => s + o.total, 0) },
        month: { orders: totalOrders, revenue: totalRevenue },
        byStatus,
        topProducts,
        monthlySales,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Descargar boleta en PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin' &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const user = await User.findById(order.user);
    const pdfBuffer = await invoiceService.generateInvoicePDF(order, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=boleta-${order._id.toString().slice(-8)}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando boleta PDF:', err);
    res.status(500).json({ message: 'Error al generar la boleta' });
  }
};

// Exportar reporte de ventas en PDF
exports.exportReportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const orders = await Order.find(filter).populate('user', 'email');
    const totalSales = orders.reduce((s, o) => s + o.total, 0);
    const count = orders.length;

    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const buf = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.pdf');
      res.send(buf);
    });

    doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Periodo: ${startDate || 'inicio'} - ${endDate || 'fin'}`);
    doc.text(`Total de pedidos: ${count}`);
    doc.text(`Ventas totales: $${totalSales.toLocaleString('es-CL')}`);
    doc.moveDown();

    orders.forEach((order) => {
      doc.text(`Pedido #${order._id.toString().slice(-8)} - ${order.user?.email} - $${order.total} - ${order.status}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Dashboard avanzado
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(startOfDay);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = await Order.find({
        status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] },
        createdAt: { $gte: dayStart, $lt: dayEnd },
      });
      const total = dayOrders.reduce((sum, o) => sum + o.total, 0);
      dailySales.push({
        date: dayStart.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
        total,
        count: dayOrders.length,
      });
    }

    const allPaidOrders = await Order.find({ status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] } });
    const totalOrders = await Order.countDocuments();
    const paidCount = allPaidOrders.length;
    const totalRevenue = allPaidOrders.reduce((sum, o) => sum + o.total, 0);
    const averageTicket = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;
    const conversionRate = totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0;

    const recentOrders = await Order.find()
      .populate('user', 'email displayName')
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      data: {
        dailySales,
        totalRevenue,
        paidCount,
        totalOrders,
        averageTicket,
        conversionRate,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email displayName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    if (req.user.role === 'cliente' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};