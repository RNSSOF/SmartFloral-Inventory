const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// تسجيل مبيعة جديدة
router.post('/', (req, res) => {
  const {
    item_type,
    item_id,
    quantity_sold,
    sale_price,
    customer_notes
  } = req.body;

  if (!item_type || !item_id || !quantity_sold || !sale_price) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  const id = uuidv4();
  const total_revenue = quantity_sold * sale_price;
  const query = `
    INSERT INTO sales
    (id, item_type, item_id, quantity_sold, sale_price, total_revenue, customer_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [id, item_type, item_id, quantity_sold, sale_price, total_revenue, customer_notes || null];

  db.run(query, params, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // تحديث الكمية في جدول الأزهار إذا كان نوع المبيعة "flower"
    if (item_type === 'flower') {
      const updateQuery = `
        UPDATE flowers
        SET quantity_current = MAX(0, quantity_current - ?)
        WHERE id = ?
      `;
      db.run(updateQuery, [quantity_sold, item_id], (err) => {
        if (err) {
          console.error('خطأ في تحديث الكمية:', err.message);
        }
      });
    }

    res.status(201).json({
      id,
      message: 'تم تسجيل المبيعة بنجاح',
      total_revenue
    });
  });
});

// الحصول على سجل المبيعات
router.get('/', (req, res) => {
  const query = `
    SELECT s.*, f.name FROM sales s
    LEFT JOIN flowers f ON s.item_id = f.id
    ORDER BY s.sale_date DESC
    LIMIT 100
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// إحصائيات المبيعات
router.get('/stats/daily', (req, res) => {
  const query = `
    SELECT
      DATE(sale_date) as sale_date,
      COUNT(*) as transaction_count,
      SUM(quantity_sold) as total_quantity,
      SUM(total_revenue) as daily_revenue,
      AVG(sale_price) as avg_price
    FROM sales
    WHERE sale_date >= datetime('now', '-30 days')
    GROUP BY DATE(sale_date)
    ORDER BY sale_date DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

module.exports = router;
