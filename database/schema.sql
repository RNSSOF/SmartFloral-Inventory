-- SmartFloral Inventory Database Schema
-- SQLite Database

-- جدول الأزهار
CREATE TABLE IF NOT EXISTS flowers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  supplier TEXT NOT NULL,
  entry_date DATETIME NOT NULL,
  expected_decay_date DATETIME NOT NULL,
  quantity_current INTEGER NOT NULL DEFAULT 0,
  quantity_initial INTEGER NOT NULL,
  original_price REAL NOT NULL,
  status TEXT DEFAULT 'fresh',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأسعار والخصومات
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT PRIMARY KEY,
  flower_id TEXT NOT NULL,
  original_price REAL NOT NULL,
  current_price REAL NOT NULL,
  discount_percentage REAL DEFAULT 0,
  discount_reason TEXT,
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flower_id) REFERENCES flowers(id)
);

-- جدول التنبيهات
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  flower_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (flower_id) REFERENCES flowers(id)
);

-- جدول الباقات (Bouquets)
CREATE TABLE IF NOT EXISTS bouquets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flowers_composition TEXT NOT NULL,
  original_price REAL NOT NULL,
  current_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_available INTEGER DEFAULT 1
);

-- جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity_sold INTEGER NOT NULL,
  sale_price REAL NOT NULL,
  total_revenue REAL NOT NULL,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_notes TEXT
);

-- جدول إحصائيات الخردة/التلف
CREATE TABLE IF NOT EXISTS waste_stats (
  id TEXT PRIMARY KEY,
  flower_id TEXT NOT NULL,
  quantity_wasted INTEGER NOT NULL,
  waste_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  waste_reason TEXT,
  estimated_loss REAL,
  FOREIGN KEY (flower_id) REFERENCES flowers(id)
);

-- إنشاء المؤشرات للبحث السريع
CREATE INDEX IF NOT EXISTS idx_flowers_status ON flowers(status);
CREATE INDEX IF NOT EXISTS idx_flowers_decay_date ON flowers(expected_decay_date);
CREATE INDEX IF NOT EXISTS idx_pricing_flower_id ON pricing(flower_id);
CREATE INDEX IF NOT EXISTS idx_alerts_flower_id ON alerts(flower_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_waste_flower_id ON waste_stats(flower_id);
