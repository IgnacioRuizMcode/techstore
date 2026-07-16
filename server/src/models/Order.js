const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantId: String,
  name: String,
  netPrice: Number,       // Precio neto (sin IVA)
  iva: Number,            // IVA por unidad
  totalPrice: Number,     // Precio total (neto + IVA)
  quantity: Number,
});

const trackingStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  location: String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: Number,          // Suma de netos
  ivaTotal: Number,          // IVA total
  total: { type: Number, required: true },  // Total final con IVA
  status: {
    type: String,
    enum: ['pending', 'paid', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  webpayToken: String,
  shippingAddress: String,
  trackingNumber: String,
  trackingCompany: {
    type: String,
    enum: ['starken', 'chilexpress', 'correos_chile', 'bluexpress', 'pullman', 'other'],
    default: null,
  },
  trackingUrl: String,
  note: String,
  deliveryMethod: {
    type: String,
    enum: ['shipping', 'pickup'],
    default: 'shipping',
  },
  trackingHistory: [trackingStepSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);