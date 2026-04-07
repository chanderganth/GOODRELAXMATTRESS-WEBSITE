const ADMIN_SECRET = process.env.ADMIN_SECRET || 'goodrelax-admin-2024';

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['x-admin-secret'] || req.headers.authorization;
  const token = authHeader && authHeader.replace('Bearer ', '');

  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Admin access required' });
  }
  next();
};

module.exports = { requireAdmin };
