const router = require('express').Router();
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const trackingService = require('../services/trackingService');

router.post('/tracking/17track', async (req, res) => {
  try {
    const events = req.body?.data || [];

    for (const event of events) {
      const { tracking_number, status, checkpoint } = event;
      const newStatus = trackingService.translateStatus(status);

      if (!newStatus) continue;

      const order = await Order.findOne({ trackingNumber: tracking_number });

      if (order && order.status !== newStatus) {
        order.status = newStatus;
        order.trackingHistory.push({
          status: newStatus,
          description: checkpoint?.message || `Actualización automática: ${status}`,
          date: new Date(),
          location: checkpoint?.location || null,
        });
        await order.save();

        // Notificar al cliente
        await Notification.create({
          user: order.user,
          type: 'order_update',
          title: `Pedido #${order._id.toString().slice(-8).toUpperCase()}`,
          message: `Actualización: ${checkpoint?.message || newStatus}`,
          link: `/profile/orders/${order._id}`,
        });

        // Notificar a admins si se entregó
        if (newStatus === 'delivered') {
          const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
          for (const admin of admins) {
            await Notification.create({
              user: admin._id,
              type: 'order_update',
              title: `✅ Pedido #${order._id.toString().slice(-8).toUpperCase()} entregado`,
              message: `El pedido con tracking ${tracking_number} fue entregado exitosamente.`,
              link: `/admin/orders?expand=${order._id}`,
            });
          }
        }

        console.log(`📦 Pedido ${order._id} actualizado vía webhook: ${newStatus}`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error procesando webhook de tracking:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;