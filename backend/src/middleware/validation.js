const { body, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').isIn(['28D_Rare', '32D_Epic', '40D_Legendary']).withMessage('Invalid category'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('densityAddition').isFloat({ min: 0 }).withMessage('Density addition must be a positive number'),
  body('description').optional().trim(),
  handleValidation,
];

const orderValidation = [
  body('customer.name').trim().notEmpty().withMessage('Customer name is required'),
  body('customer.phone').trim().notEmpty().withMessage('Phone is required'),
  body('customer.email').optional().isEmail().withMessage('Invalid email'),
  body('customer.address').trim().notEmpty().withMessage('Delivery address is required'),
  body('mattress').isObject().withMessage('Mattress config is required'),
  body('mattress.length').isFloat({ min: 1 }).withMessage('Length is required'),
  body('mattress.width').isFloat({ min: 1 }).withMessage('Width is required'),
  body('mattress.thickness').isFloat({ min: 1 }).withMessage('Thickness is required'),
  body('mattress.density').isIn(['28D_Rare', '32D_Epic', '40D_Legendary']).withMessage('Invalid density'),
  body('totalPrice').isFloat({ min: 0 }).withMessage('Total price is required'),
  handleValidation,
];

module.exports = { productValidation, orderValidation, handleValidation };
