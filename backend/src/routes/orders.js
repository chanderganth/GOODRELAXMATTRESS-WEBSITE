const router = require('express').Router();
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, getDashboardStats } = require('../controllers/orderController');
const { requireAdmin } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

router.get('/stats', requireAdmin, getDashboardStats);
router.get('/', requireAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.post('/', orderValidation, createOrder);
router.put('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
