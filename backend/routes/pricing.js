const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// الحصول على سياسات التسعير
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, f.name FROM pricing p
    JOIN flowers f ON p.flower_id = f.id
    ORDER BY p.applied_date DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// تطبيق خصم ديناميكي
router.post('/apply-discount', (req, res) => {
  const {
    flower_id,
    discount_percentage,
    reason
  } = req.body;

  if (!flower_id || discount_percentage === undefined) {
    return res.status(400).json({ error: 'flower_id و discount_percentage مطلوبة' });
  }

  // الحصول على السعر الأصلي
  const getFlowerQuery = `SELECT original_price FROM flowers WHERE id = ?`;

  db.get(getFlowerQuery, [flower_id], (err, flower) => {
    if (err || !flower) {
      return res.status(404).json({ error: 'الوردة غير موجودة' });
    }

    const original_price = flower.original_price;
    const current_price = original_price * (1 - discount_percentage / 100);

    const pricingId = uuidv4();
    const query = `
      UPDATE pricing SET
        current_price = ?,
        discount_percentage = ?,
        discount_reason = ?,
        applied_date = CURRENT_TIMESTAMP
      WHERE flower_id = ?
    `;

    db.run(query, [current_price, discount_percentage, reason, flower_id], function (err) {
      if (err) {
        // إذا لم يوجد صف، أنشئ واحداً جديداً
        const insertQuery = `
          INSERT INTO pricing (id, flower_id, original_price, current_price, discount_percentage, discount_reason)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(insertQuery, [pricingId, flower_id, original_price, current_price, discount_percentage, reason], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({
            message: 'تم تطبيق الخصم بنجاح',
            original_price,
            current_price,
            discount_percentage
          });
        });
      } else {
        res.json({
          message: 'تم تحديث الخصم بنجاح',
          original_price,
          current_price,
          discount_percentage
        });
      }
    });
  });
});

// الحصول على إحصائيات التسعير
router.get('/stats/summary', (req, res) => {
  const query = `
    SELECT
      COUNT(*) as total_flowers,
      SUM(CASE WHEN discount_percentage > 0 THEN 1 ELSE 0 END) as discounted_items,
      AVG(discount_percentage) as avg_discount,
      MAX(discount_percentage) as max_discount
    FROM pricing p
  `;

  db.get(query, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(stats);
  });
});

module.exports = router;
