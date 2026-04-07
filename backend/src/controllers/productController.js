const { getDb } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const db = getDb();
    const { category } = req.query;
    let query = db.collection('products').where('isActive', '==', true);
    if (category) query = query.where('category', '==', category);
    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET product by ID
const getProductById = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create product (admin)
const createProduct = async (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const product = {
      ...req.body,
      id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('products').doc(id).set(product);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update product (admin)
const updateProduct = async (req, res) => {
  try {
    const db = getDb();
    const ref = db.collection('products').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Product not found' });
    const updated = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(updated);
    res.json({ success: true, data: { id: doc.id, ...doc.data(), ...updated } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE product (admin)
const deleteProduct = async (req, res) => {
  try {
    const db = getDb();
    const ref = db.collection('products').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Product not found' });
    await ref.update({ isActive: false, updatedAt: new Date().toISOString() });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET pricing config
const getPricingConfig = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('config').doc('pricing').get();
    if (!doc.exists) {
      const defaultConfig = {
        basePricePerSqft: 800,
        densityAdditions: { '28D_Rare': 0, '32D_Epic': 500, '40D_Legendary': 700 },
        hardnessLevels: { soft: 5, medium: 10, firm: 15 },
        layerPrices: {
          foam: 0, memoryFoam: 1500, latex: 2000, coir: 800, spring: 2500,
        },
        fabricPrices: { cotton: 0, velvet: 1200, bamboo: 1800, knitted: 600 },
        gstRate: 18,
      };
      await db.collection('config').doc('pricing').set(defaultConfig);
      return res.json({ success: true, data: defaultConfig });
    }
    res.json({ success: true, data: doc.data() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update pricing config (admin)
const updatePricingConfig = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('config').doc('pricing').set(req.body, { merge: true });
    res.json({ success: true, message: 'Pricing config updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getPricingConfig, updatePricingConfig,
};
