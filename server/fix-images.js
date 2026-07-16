const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({});
    console.log(`Actualizando ${products.length} productos...`);

    for (const p of products) {
      p.mainImage = `https://picsum.photos/seed/${p._id}/800/800`;
      p.images = [
        `https://picsum.photos/seed/${p._id}a/800/800`,
        `https://picsum.photos/seed/${p._id}b/800/800`,
        `https://picsum.photos/seed/${p._id}c/800/800`,
      ];
      await p.save();
    }

    console.log('✅ Imágenes actualizadas correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();