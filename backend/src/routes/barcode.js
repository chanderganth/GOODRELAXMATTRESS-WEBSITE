const router = require('express').Router();
const { generateBarcode } = require('../controllers/barcodeController');

router.post('/generate', generateBarcode);

module.exports = router;
