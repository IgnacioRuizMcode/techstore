const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate('product', 'name slug basePrice mainImage') // solo los campos que necesitas
      .sort('-addedAt')
      .lean(); // objetos planos de JavaScript, mucho más rápido

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return res.json({ success: true, action: 'removed' });
    }

    await Wishlist.create({ user: req.user._id, product: productId });
    res.json({ success: true, action: 'added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId,
    });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};