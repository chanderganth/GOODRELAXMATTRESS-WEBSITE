const { getDb, getRealtimeDb } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `GRM-${timestamp}-${random}`;
};

// GET all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const db = getDb();
    const { status, limit = 50 } = req.query;
    let query = db.collection('orders').orderBy('createdAt', 'desc').limit(parseInt(limit));
    if (status) query = db.collection('orders').where('status', '==', status).orderBy('createdAt', 'desc');
    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET order by ID or order number
const getOrderById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    // Try direct doc lookup first
    const doc = await db.collection('orders').doc(id).get();
    if (doc.exists) return res.json({ success: true, data: { id: doc.id, ...doc.data() } });
    // Try by orderNumber
    const snapshot = await db.collection('orders').where('orderNumber', '==', id).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ success: false, message: 'Order not found' });
    const orderDoc = snapshot.docs[0];
    res.json({ success: true, data: { id: orderDoc.id, ...orderDoc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create order
const createOrder = async (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const orderNumber = generateOrderNumber();
    const order = {
      ...req.body,
      id,
      orderNumber,
      status: 'pending',
      productionStatus: 'not_started',
      timeline: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('orders').doc(id).set(order);

    // Update customer record
    if (req.body.customer?.phone) {
      const custRef = db.collection('customers').doc(req.body.customer.phone);
      const custDoc = await custRef.get();
      if (custDoc.exists) {
        await custRef.update({
          totalOrders: (custDoc.data().totalOrders || 0) + 1,
          totalSpent: (custDoc.data().totalSpent || 0) + req.body.totalPrice,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await custRef.set({
          ...req.body.customer,
          totalOrders: 1,
          totalSpent: req.body.totalPrice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Real-time notification via RTDB
    try {
      const rtdb = getRealtimeDb();
      await rtdb.ref(`notifications/orders/${id}`).set({
        orderNumber,
        type: 'new_order',
        timestamp: Date.now(),
      });
    } catch (_) { /* RTDB optional */ }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const db = getDb();
    const { status, productionStatus, note } = req.body;
    const ref = db.collection('orders').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Order not found' });

    const update = { updatedAt: new Date().toISOString() };
    if (status) update.status = status;
    if (productionStatus) update.productionStatus = productionStatus;

    const timelineEntry = {
      status: status || productionStatus,
      timestamp: new Date().toISOString(),
      note: note || '',
    };
    update.timeline = [...(doc.data().timeline || []), timelineEntry];

    await ref.update(update);
    res.json({ success: true, data: { id: doc.id, ...doc.data(), ...update } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET dashboard stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    const db = getDb();
    const [ordersSnap, customersSnap] = await Promise.all([
      db.collection('orders').get(),
      db.collection('customers').get(),
    ]);

    const orders = ordersSnap.docs.map(d => d.data());
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalCustomers: customersSnap.size,
        totalRevenue,
        statusCounts,
        recentOrders: orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrderStatus, getDashboardStats };
