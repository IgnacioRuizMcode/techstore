const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProduct);

// Configurar campos de archivos para múltiples imágenes
const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

router.post('/', authenticate, authorize('admin', 'superadmin'), uploadFields, productController.createProduct);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), uploadFields, productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), productController.deleteProduct);
router.patch('/:id/stock', authenticate, authorize('admin', 'superadmin'), productController.updateStock);
router.post('/:productId/notify-stock', productController.requestStockNotification);
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;