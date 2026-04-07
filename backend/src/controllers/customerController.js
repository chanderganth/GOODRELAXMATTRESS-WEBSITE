const { getDb } = require('../config/firebase');

// GET all customers (admin)
const getAllCustomers = async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('customers').orderBy('createdAt', 'desc').get();
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: customers, total: customers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET customer by phone
const getCustomerByPhone = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('customers').doc(req.params.phone).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Customer not found' });
    // Get their orders
    const ordersSnap = await db.collection('orders')
      .where('customer.phone', '==', req.params.phone)
      .orderBy('createdAt', 'desc')
      .get();
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data: { ...doc.data(), orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllCustomers, getCustomerByPhone };
