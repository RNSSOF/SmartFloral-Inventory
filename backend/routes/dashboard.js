const express = require('express');
const router = express.Router();
const db = require('../db');

// Dashboard الملخص
router.get('/summary', (req, res) => {
  const queries = {
    total_flowers: `SELECT COUNT(*) as count FROM flowers`,
    total_quantity: `SELECT SUM(quantity_current) as total FROM flowers`,
    critical_alerts: `SELECT COUNT(*) as count FROM alerts WHERE severity IN ('critical', 'high') AND resolved_at IS NULL`,
    flowers_expiring_soon: `SELECT COUNT(*) as count FROM flowers WHERE expected_decay_date <= datetime('now', '+3 days')`,
    total_revenue_today: `SELECT COALESCE(SUM(total_revenue), 0) as total FROM sales WHERE DATE(sale_date) = DATE('now')`,
    total_revenue_month: `SELECT COALESCE(SUM(total_revenue), 0) as total FROM sales WHERE DATE(sale_date) >= datetime('now', 'start of month')`,
    discounted_items: `SELECT COUNT(*) as count FROM pricing WHERE discount_percentage > 0`
  };

  const summary = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], (err, row) => {
      if (err) {
        console.error(`Error in ${key}:`, err.message);
        summary[key] = null;
      } else {
        if (key === 'total_quantity') {
          summary[key] = row?.total || 0;
        } else if (key.includes('revenue')) {
          summary[key] = row?.total || 0;
        } else {
          summary[key] = row?.count || 0;
        }
      }

      completed++;
      if (completed === Object.keys(queries).length) {
        res.json(summary);
      }
    });
  });
});

// إحصائيات الأزهار الحرجة
router.get('/critical-flowers', (req, res) => {
  const query = `
    SELECT
      f.id,
      f.name,
      f.quantity_current,
      f.expected_decay_date,
      CAST((julianday(f.expected_decay_date) - julianday('now')) AS INT) as hours_remaining,
      CASE
        WHEN f.expected_decay_date <= datetime('now') THEN 'expired'
        WHEN f.expected_decay_date <= datetime('now', '+12 hours') THEN 'critical'
        WHEN f.expected_decay_date <= datetime('now', '+24 hours') THEN 'high'
        WHEN f.expected_decay_date <= datetime('now', '+72 hours') THEN 'medium'
        ELSE 'low'
      END as priority
    FROM flowers f
    WHERE f.expected_decay_date <= datetime('now', '+3 days')
    ORDER BY f.expected_decay_date ASC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// إحصائيات الأداء
router.get('/performance', (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM flowers WHERE status = 'fresh') as fresh_items,
      (SELECT COUNT(*) FROM flowers WHERE status = 'warning') as warning_items,
      (SELECT COUNT(*) FROM flowers WHERE status = 'critical') as critical_items,
      (SELECT COUNT(*) FROM flowers WHERE status = 'expired') as expired_items,
      (SELECT COALESCE(SUM(quantity_sold), 0) FROM sales WHERE DATE(sale_date) = DATE('now')) as today_sales,
      (SELECT COALESCE(AVG(discount_percentage), 0) FROM pricing WHERE discount_percentage > 0) as avg_discount
  `;

  db.get(query, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// تنبيهات لوحة التحكم
router.get('/top-alerts', (req, res) => {
  const query = `
    SELECT
      a.id,
      a.flower_id,
      a.alert_type,
      a.severity,
      a.message,
      f.name as flower_name,
      f.quantity_current
    FROM alerts a
    JOIN flowers f ON a.flower_id = f.id
    WHERE a.resolved_at IS NULL
    ORDER BY
      CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
      END
    LIMIT 5
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

module.exports = router;
