const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// الحصول على جميع التنبيهات
router.get('/', (req, res) => {
  const query = `
    SELECT
      a.id,
      a.flower_id,
      a.alert_type,
      a.message,
      a.severity,
      a.is_read,
      a.created_at,
      f.name as flower_name,
      f.quantity_current,
      f.expected_decay_date
    FROM alerts a
    JOIN flowers f ON a.flower_id = f.id
    WHERE a.resolved_at IS NULL
    ORDER BY
      CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      a.created_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// الحصول على التنبيهات الحرجة فقط
router.get('/critical', (req, res) => {
  const query = `
    SELECT a.*, f.name as flower_name
    FROM alerts a
    JOIN flowers f ON a.flower_id = f.id
    WHERE a.severity IN ('critical', 'high')
    AND a.resolved_at IS NULL
    ORDER BY a.created_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// إنشاء تنبيه جديد
router.post('/', (req, res) => {
  const { flower_id, alert_type, message, severity } = req.body;

  if (!flower_id || !alert_type || !message) {
    return res.status(400).json({ error: 'flower_id و alert_type و message مطلوبة' });
  }

  const id = uuidv4();
  const query = `
    INSERT INTO alerts (id, flower_id, alert_type, message, severity)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [id, flower_id, alert_type, message, severity || 'medium'];

  db.run(query, params, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id, message: 'تم إنشاء التنبيه بنجاح' });
  });
});

// وضع علامة على التنبيه كمقروء
router.put('/:id/read', (req, res) => {
  const { id } = req.params;

  const query = `UPDATE alerts SET is_read = 1 WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'التنبيه غير موجود' });
    }
    res.json({ message: 'تم وضع علامة على التنبيه كمقروء' });
  });
});

// حل التنبيه
router.put('/:id/resolve', (req, res) => {
  const { id } = req.params;

  const query = `UPDATE alerts SET resolved_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'التنبيه غير موجود' });
    }
    res.json({ message: 'تم حل التنبيه' });
  });
});

module.exports = router;
