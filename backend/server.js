const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./db');

// استيراد المسارات
const flowerRoutes = require('./routes/flowers');
const bouquetRoutes = require('./routes/bouquets');
const alertRoutes = require('./routes/alerts');
const pricingRoutes = require('./routes/pricing');
const salesRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// استخدام المسارات
app.use('/api/flowers', flowerRoutes);
app.use('/api/bouquets', bouquetRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`\n🌸 SmartFloral Inventory Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`\n🔗 Endpoints:`);
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/flowers');
  console.log('  - POST /api/flowers');
  console.log('  - GET  /api/alerts');
  console.log('  - GET  /api/dashboard/summary');
});

module.exports = app;
