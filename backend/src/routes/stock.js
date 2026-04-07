const router = require('express').Router();
const { getStock, updateStock, getStockLogs } = require('../controllers/stockController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, getStock);
router.get('/logs', requireAdmin, getStockLogs);
router.put('/', requireAdmin, updateStock);

module.exports = router;
