const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const couponController = require('../controllers/couponController');

// Validar cupón desde el carrito (cualquier usuario autenticado)
router.post('/validate', authenticate, couponController.validateCoupon);

// Gestión de cupones (admin y superadmin)
router.get('/', authenticate, authorize('admin', 'superadmin'), couponController.getAllCoupons);
router.post('/', authenticate, authorize('admin', 'superadmin'), couponController.createCoupon);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), couponController.updateCoupon);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), couponController.deleteCoupon);

module.exports = router;