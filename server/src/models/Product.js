const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: String,
  name: String,
  attributes: { type: Map, of: String },
  price: Number,
  stock: { type: Number, default: 0, min: 0 },
  imageUrl: String,
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  category: { type: String, required: true },
  brand: String,
  basePrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  mainImage: String,
  images: [{ type: String }], // ← NUEVO: array de rutas
  variants: [variantSchema],
  features: [String],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  notifyStockRequests: [
    {
      email: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);