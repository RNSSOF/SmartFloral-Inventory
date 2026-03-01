const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { calculateDecayDate, calculateDaysUntilDecay } = require('../utils/calculations');

// الحصول على جميع الأزهار
router.get('/', (req, res) => {
  const query = `
    SELECT
      f.*,
      p.current_price,
      p.discount_percentage,
      COUNT(s.id) as times_sold,
      SUM(s.quantity_sold) as total_sold
    FROM flowers f
    LEFT JOIN pricing p ON f.id = p.flower_id
    LEFT JOIN sales s ON f.id = s.item_id
    GROUP BY f.id
    ORDER BY f.updated_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // إضافة معلومات إضافية
    const enrichedRows = rows.map(row => ({
      ...row,
      days_until_decay: calculateDaysUntilDecay(new Date(row.expected_decay_date)),
      status: getFlowerStatus(new Date(row.expected_decay_date)),
      remaining_quantity: row.quantity_current
    }));

    res.json(enrichedRows);
  });
});

// الحصول على وردة محددة
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT f.*, p.current_price, p.discount_percentage
    FROM flowers f
    LEFT JOIN pricing p ON f.id = p.flower_id
    WHERE f.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'الوردة غير موجودة' });
    }

    row.days_until_decay = calculateDaysUntilDecay(new Date(row.expected_decay_date));
    row.status = getFlowerStatus(new Date(row.expected_decay_date));

    res.json(row);
  });
});

// إضافة وردة جديدة
router.post('/', (req, res) => {
  const {
    name,
    type,
    supplier,
    quantity,
    original_price,
    expected_lifespan_days
  } = req.body;

  // التحقق من البيانات المدخلة
  if (!name || !type || !supplier || !quantity || !original_price || !expected_lifespan_days) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  const id = uuidv4();
  const entry_date = new Date();
  const expected_decay_date = calculateDecayDate(entry_date, expected_lifespan_days);
  const sku = `${type.substring(0, 3).toUpperCase()}-${Date.now()}`;

  const query = `
    INSERT INTO flowers
    (id, name, sku, type, supplier, entry_date, expected_decay_date,
     quantity_current, quantity_initial, original_price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id,
    name,
    sku,
    type,
    supplier,
    entry_date.toISOString(),
    expected_decay_date.toISOString(),
    quantity,
    quantity,
    original_price,
    'fresh'
  ];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // إضافة سعر أولي
    const pricingQuery = `
      INSERT INTO pricing (id, flower_id, original_price, current_price, discount_percentage)
      VALUES (?, ?, ?, ?, ?)
    `;
    const pricingParams = [uuidv4(), id, original_price, original_price, 0];

    db.run(pricingQuery, pricingParams, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'تم إضافة الوردة بنجاح',
        flower_id: id,
        sku: sku,
        expected_decay_date: expected_decay_date
      });
    });
  });
});

// تحديث كمية الوردة
router.put('/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { quantity, action } = req.body;

  if (!quantity || !action) {
    return res.status(400).json({ error: 'الكمية والإجراء مطلوبان' });
  }

  if (action !== 'add' && action !== 'remove' && action !== 'set') {
    return res.status(400).json({ error: 'الإجراء يجب أن يكون add أو remove أو set' });
  }

  let updateQuery;
  if (action === 'set') {
    updateQuery = `UPDATE flowers SET quantity_current = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  } else if (action === 'add') {
    updateQuery = `UPDATE flowers SET quantity_current = quantity_current + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  } else {
    updateQuery = `UPDATE flowers SET quantity_current = MAX(0, quantity_current - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  }

  db.run(updateQuery, [quantity, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'الوردة غير موجودة' });
    }

    res.json({ message: 'تم تحديث الكمية بنجاح' });
  });
});

// حذف وردة
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM flowers WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'الوردة غير موجودة' });
    }

    res.json({ message: 'تم حذف الوردة بنجاح' });
  });
});

// الدوال المساعدة
function getFlowerStatus(decayDate) {
  const now = new Date();
  const daysUntilDecay = Math.ceil((decayDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilDecay <= 0) return 'expired';
  if (daysUntilDecay <= 1) return 'critical';
  if (daysUntilDecay <= 3) return 'warning';
  return 'fresh';
}

module.exports = router;
