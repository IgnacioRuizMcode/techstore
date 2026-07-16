const Review = require('../models/Review');

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'displayName photoUrl')
      .sort('-createdAt');
    
    // Calcular promedio
    const avg = reviews.length > 0 
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length 
      : 0;

    res.json({ success: true, data: { reviews, average: Math.round(avg * 10) / 10, count: reviews.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Verificar que no haya otra reseña del mismo usuario para este producto
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya has dejado una reseña para este producto' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      isVerifiedPurchase: false, // Se podría verificar con pedidos más adelante
    });

    const populated = await review.populate('user', 'displayName photoUrl');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada o no autorizada' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};