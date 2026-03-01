const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// الحصول على جميع الباقات
router.get('/', (req, res) => {
  const query = `
    SELECT * FROM bouquets
    WHERE is_available = 1
    ORDER BY created_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // تحليل composition
    const enriched = rows.map(row => ({
      ...row,
      flowers_composition: JSON.parse(row.flowers_composition || '[]')
    }));

    res.json(enriched || []);
  });
});

// إنشاء باقة جديدة
router.post('/', (req, res) => {
  const {
    name,
    description,
    flowers_composition,
    original_price
  } = req.body;

  if (!name || !flowers_composition || !original_price) {
    return res.status(400).json({ error: 'الاسم والأزهار والسعر مطلوبة' });
  }

  const id = uuidv4();
  const composition_json = JSON.stringify(flowers_composition);
  const query = `
    INSERT INTO bouquets
    (id, name, description, flowers_composition, original_price, current_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [id, name, description || null, composition_json, original_price, original_price];

  db.run(query, params, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id,
      message: 'تم إنشاء الباقة بنجاح'
    });
  });
});

// تحديث سعر الباقة
router.put('/:id/price', (req, res) => {
  const { id } = req.params;
  const { current_price } = req.body;

  if (!current_price) {
    return res.status(400).json({ error: 'السعر مطلوب' });
  }

  const query = `
    UPDATE bouquets
    SET current_price = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [current_price, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'الباقة غير موجودة' });
    }
    res.json({ message: 'تم تحديث السعر بنجاح' });
  });
});

// حذف باقة
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = `UPDATE bouquets SET is_available = 0 WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'الباقة غير موجودة' });
    }
    res.json({ message: 'تم حذف الباقة بنجاح' });
  });
});

module.exports = router;
