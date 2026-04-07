const { getDb } = require('../config/firebase');

// GET stock levels
const getStock = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('config').doc('stock').get();
    const defaultStock = {
      foam: { quantity: 100, unit: 'blocks', threshold: 10 },
      memoryFoam: { quantity: 50, unit: 'blocks', threshold: 5 },
      latex: { quantity: 30, unit: 'blocks', threshold: 5 },
      coir: { quantity: 80, unit: 'blocks', threshold: 10 },
      spring: { quantity: 40, unit: 'units', threshold: 5 },
      cottonFabric: { quantity: 200, unit: 'meters', threshold: 20 },
      velvetFabric: { quantity: 100, unit: 'meters', threshold: 10 },
      bambooFabric: { quantity: 60, unit: 'meters', threshold: 10 },
      knittedFabric: { quantity: 150, unit: 'meters', threshold: 15 },
    };
    if (!doc.exists) {
      await db.collection('config').doc('stock').set(defaultStock);
      return res.json({ success: true, data: defaultStock });
    }
    res.json({ success: true, data: doc.data() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update stock levels (admin)
const updateStock = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('config').doc('stock').set(req.body, { merge: true });
    // Log stock update
    await db.collection('stockLogs').add({
      changes: req.body,
      timestamp: new Date().toISOString(),
    });
    res.json({ success: true, message: 'Stock updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET stock logs
const getStockLogs = async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('stockLogs')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStock, updateStock, getStockLogs };
