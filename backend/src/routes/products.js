const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getPricingConfig, updatePricingConfig,
} = require('../controllers/productController');
const { requireAdmin } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

// Image upload config
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Only jpg, jpeg, png, webp images are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getAllProducts);
router.get('/pricing', getPricingConfig);
router.get('/:id', getProductById);

// Admin routes
router.post('/', requireAdmin, productValidation, createProduct);
router.put('/pricing/config', requireAdmin, updatePricingConfig);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

// Image upload (admin) — up to 5 images
router.post('/upload', requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images provided' });
  }
  const urls = req.files.map(f => `/uploads/products/${f.filename}`);
  res.json({ success: true, data: urls });
});

module.exports = router;
