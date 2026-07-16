const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, orderController.createOrder);
router.get('/confirm', orderController.confirmPayment);
router.get('/mine', authenticate, orderController.getUserOrders);
router.get('/all', authenticate, authorize('admin', 'superadmin'), orderController.getAllOrders);
router.get('/stats', authenticate, authorize('admin', 'superadmin'), orderController.getStats);
router.get('/dashboard', authenticate, authorize('admin', 'superadmin'), orderController.getDashboardStats);
router.patch('/:orderId/status', authenticate, authorize('admin', 'superadmin'), orderController.updateOrderStatus);
router.patch('/:orderId/note', authenticate, authorize('admin', 'superadmin'), orderController.updateNote);
router.post('/:orderId/ship', authenticate, authorize('admin', 'superadmin'), orderController.markAsShipped);
router.post('/:orderId/tracking', authenticate, authorize('admin', 'superadmin'), orderController.addTrackingUpdate);
router.get('/:orderId/invoice', authenticate, orderController.downloadInvoice);
router.get('/report/pdf', authenticate, authorize('admin', 'superadmin'), orderController.exportReportPDF);
router.get('/:id', authenticate, orderController.getOrderById);


module.exports = router;