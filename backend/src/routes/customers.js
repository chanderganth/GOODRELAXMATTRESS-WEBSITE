const router = require('express').Router();
const { getAllCustomers, getCustomerByPhone } = require('../controllers/customerController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, getAllCustomers);
router.get('/:phone', requireAdmin, getCustomerByPhone);

module.exports = router;
