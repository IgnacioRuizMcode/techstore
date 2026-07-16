const router = require('express').Router();
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/wishlistController');

router.use(authenticate);
router.get('/', ctrl.getWishlist);
router.post('/toggle', ctrl.toggleWishlist);
router.delete('/:productId', ctrl.removeFromWishlist);

module.exports = router;