const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Obtener carrito del usuario
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Agregar producto al carrito (ajuste automático al stock máximo)
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Stock disponible según variante o producto base
    let stockAvailable = 0;
    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) return res.status(404).json({ message: 'Variante no encontrada' });
      stockAvailable = variant.stock;
    } else {
      stockAvailable = product.stock;
    }

    // Obtener carrito actual del usuario
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId && item.variantId === variantId
    );
    const currentInCart = existingItem ? existingItem.quantity : 0;
    const requestedTotal = currentInCart + quantity;

    // Calcular cuánto se puede agregar realmente
    let allowedQuantity = quantity;
    if (requestedTotal > stockAvailable) {
      allowedQuantity = Math.max(0, stockAvailable - currentInCart);
    }

    // Si no se puede agregar nada, informar
    if (allowedQuantity === 0) {
      return res.status(400).json({
        message: `Ya tienes el máximo de ${stockAvailable} unidades disponibles en el carrito`,
      });
    }

    // Agregar o actualizar el item
    if (existingItem) {
      existingItem.quantity += allowedQuantity;
    } else {
      cart.items.push({
        product: productId,
        variantId,
        quantity: allowedQuantity,
        price: variantId ? product.variants.id(variantId).price : product.basePrice,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    cart = await cart.populate('items.product');

    // Mensaje si la cantidad fue ajustada
    const message =
      allowedQuantity < quantity
        ? `Se agregaron ${allowedQuantity} de ${quantity} (stock máximo alcanzado)`
        : 'Producto agregado correctamente';

    res.json({ success: true, data: cart, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Actualizar cantidad de un item (ajuste automático al máximo disponible)
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });

    // Stock disponible
    let stockAvailable = 0;
    if (item.variantId) {
      const product = await Product.findById(item.product._id);
      const variant = product?.variants.id(item.variantId);
      stockAvailable = variant ? variant.stock : 0;
    } else {
      stockAvailable = item.product.stock;
    }

    // Ajustar al máximo permitido
    const finalQuantity = Math.min(quantity, stockAvailable);
    if (finalQuantity === 0) {
      return res.status(400).json({ message: 'No hay stock disponible' });
    }

    item.quantity = finalQuantity;
    cart.updatedAt = Date.now();
    await cart.save();

    const message =
      finalQuantity < quantity
        ? `Cantidad ajustada a ${finalQuantity} (máximo disponible)`
        : 'Cantidad actualizada';

    res.json({ success: true, data: cart, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Eliminar un item del carrito
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.items.pull({ _id: itemId });
    await cart.save();
    cart = await cart.populate('items.product');

    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Vaciar carrito
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};