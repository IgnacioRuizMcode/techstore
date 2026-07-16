const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const emailService = require('../services/emailService');

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, active } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.active = active === 'true';
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(filter).sort('-createdAt');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const param = req.params.slug;
    let product = null;
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(param);
    }
    if (!product) {
      product = await Product.findOne({ slug: param });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (typeof productData.variants === 'string') {
      try { productData.variants = JSON.parse(productData.variants); } catch (e) { productData.variants = []; }
    }
    if (req.files?.mainImage?.[0]) productData.mainImage = `/uploads/${req.files.mainImage[0].filename}`;
    if (req.files?.images) productData.images = req.files.images.map(f => `/uploads/${f.filename}`);
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const oldStock = product.stock;
    const updates = req.body;
    if (typeof updates.variants === 'string') {
      try { updates.variants = JSON.parse(updates.variants); } catch (e) { updates.variants = []; }
    }
    if (req.files?.mainImage?.[0]) {
      if (product.mainImage) {
        const oldPath = path.join(__dirname, '..', product.mainImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.mainImage = `/uploads/${req.files.mainImage[0].filename}`;
    }
    if (req.files?.images) {
      updates.images = req.files.images.map(f => `/uploads/${f.filename}`);
    }

    Object.assign(product, updates);
    await product.save();

    if (oldStock === 0 && product.stock > 0 && product.notifyStockRequests.length > 0) {
      const emails = product.notifyStockRequests.map(r => r.email);
      const productUrl = `${process.env.CLIENT_URL}/products/${product.slug}`;
      console.log(`📧 (PUT) Enviando notificaciones a: ${emails.join(', ')}`);
      emails.forEach(email => {
        emailService.sendStockNotification(email, product.name, productUrl)
          .then(() => console.log(`✅ Notificación enviada a ${email}`))
          .catch(e => console.error(`❌ Error notificando a ${email}:`, e.message));
      });
      product.notifyStockRequests = [];
      await product.save();
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    if (product.mainImage) {
      const imgPath = path.join(__dirname, '..', product.mainImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    // Borrar imágenes adicionales
    if (product.images) {
      product.images.forEach(img => {
        const imgPath = path.join(__dirname, '..', img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }
    await product.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const oldStock = product.stock;
    product.stock = req.body.stock;
    await product.save();

    console.log(`📦 Stock actualizado: ${product.name} | Viejo: ${oldStock} → Nuevo: ${product.stock} | Solicitudes pendientes: ${product.notifyStockRequests.length}`);

    if (oldStock === 0 && product.stock > 0 && product.notifyStockRequests.length > 0) {
      const emails = product.notifyStockRequests.map(r => r.email);
      const productUrl = `${process.env.CLIENT_URL}/products/${product.slug}`;

      console.log(`📧 Enviando notificaciones a: ${emails.join(', ')}`);

      emails.forEach(email => {
        emailService.sendStockNotification(email, product.name, productUrl)
          .then(() => console.log(`✅ Notificación enviada a ${email}`))
          .catch(e => console.error(`❌ Error notificando a ${email}:`, e.message));
      });

      product.notifyStockRequests = [];
      await product.save();
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.requestStockNotification = async (req, res) => {
  try {
    const { productId } = req.params;
    const { email } = req.body;
    
    console.log(`📩 Solicitud de notificación: producto=${productId}, email=${email}`);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    
    const alreadyRequested = product.notifyStockRequests.some(r => r.email === email);
    if (!alreadyRequested) {
      product.notifyStockRequests.push({ email });
      await product.save();
      console.log(`➕ Email agregado a la lista de notificaciones. Total: ${product.notifyStockRequests.length}`);
    } else {
      console.log(`ℹ️ El email ya estaba en la lista.`);
    }
    
    res.json({ success: true, message: 'Te avisaremos cuando vuelva el stock' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      active: true
    })
      .select('name slug basePrice mainImage images brand category stock')
      .limit(4);

    // Formatear para que sea similar a lo que espera el frontend
    const data = related.map(p => ({
      _id: p._id,
      slug: p.slug,
      name: p.name,
      basePrice: p.basePrice,
      mainImage: p.mainImage,
      images: p.images,
      brand: p.brand,
      category: p.category,
      stock: p.stock,
      rating: 4.5, // placeholder, luego puedes calcular el rating real
      reviewCount: Math.floor(Math.random() * 100) // placeholder
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};