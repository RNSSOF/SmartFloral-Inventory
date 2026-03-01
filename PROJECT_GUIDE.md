# 📋 دليل الملفات - SmartFloral Inventory

## ✅ ما تم إنجازه

تم إنشاء **Prototype كامل وموظفي** لنظام إدارة مخزون الورد الذكي مع:

- ✅ **Backend API كامل** (Node.js + Express)
- ✅ **قاعدة بيانات SQLite** مع 8 جداول مترابطة
- ✅ **Frontend React** بـ 4 واجهات رئيسية
- ✅ **نظام تنبيهات ذكي**
- ✅ **محرك تسعير ديناميكي**

---

## 📁 هيكل الملفات المفصل

```
SmartFloral-Inventory/
│
├── 📄 package.json                 ← الملف الرئيسي للمشروع
├── 📄 README.md                    ← دليل المشروع
├── 📄 .gitignore                   ← ملف Git
│
├── 🔧 backend/                     ← BACKEND SERVER
│   ├── 📄 package.json             ← مكتبات Backend (express, sqlite3, etc)
│   ├── 📄 server.js                ← خادم Express الرئيسي
│   ├── 📄 db.js                    ← تهيئة قاعدة البيانات
│   ├── 📄 .env                     ← متغيرات البيئة (PORT, NODE_ENV)
│   │
│   ├── 📂 routes/                  ← API Endpoints
│   │   ├── flowers.js              ← إدارة الأزهار (CRUD)
│   │   ├── alerts.js               ← نظام التنبيهات
│   │   ├── pricing.js              ← إدارة التسعير الديناميكي
│   │   ├── sales.js                ← تسجيل وتتبع المبيعات
│   │   ├── bouquets.js             ← إدارة الباقات (المستقبل)
│   │   └── dashboard.js            ← لوحة التحكم والإحصائيات
│   │
│   └── 📂 utils/                   ← دوال مساعدة
│       └── calculations.js         ← حسابات التاريخ، الخصم، الحالة
│
├── 🎨 frontend/                    ← REACT APP
│   ├── 📄 package.json             ← مكتبات Frontend (react, axios, etc)
│   │
│   ├── 📂 public/
│   │   └── index.html              ← صفحة HTML الرئيسية
│   │
│   └── 📂 src/
│       ├── 📄 index.js             ← نقطة البداية
│       ├── 📄 index.css            ← أنماط عامة
│       ├── 📄 App.js               ← المكون الرئيسي (التنقل)
│       ├── 📄 App.css              ← أنماط التطبيق
│       │
│       └── 📂 components/          ← مكونات React
│           ├── Dashboard.js        ← لوحة التحكم
│           ├── Dashboard.css
│           ├── FlowerInventory.js  ← إدارة المخزون
│           ├── FlowerInventory.css
│           ├── Alerts.js           ← نظام التنبيهات
│           ├── Alerts.css
│           ├── Pricing.js          ← إدارة التسعير
│           └── Pricing.css
│
└── 🗄️ database/
    └── schema.sql                  ← هيكل قاعدة البيانات

```

---

## 🗄️ جداول قاعدة البيانات

### 1. **flowers** - الأزهار
يحفظ معلومات كل نوع من الورود المتاح
- `id`, `name`, `sku`, `type`, `supplier`
- `entry_date`, `expected_decay_date`
- `quantity_current`, `quantity_initial`
- `original_price`, `status`

### 2. **pricing** - التسعير والخصومات
يتتبع الأسعار والخصومات الحالية
- `id`, `flower_id`, `original_price`, `current_price`
- `discount_percentage`, `discount_reason`

### 3. **alerts** - التنبيهات
تسجيل جميع التنبيهات التلقائية
- `id`, `flower_id`, `alert_type`, `message`
- `severity` (critical, high, medium, low)
- `is_read`, `resolved_at`

### 4. **bouquets** - الباقات
تخزين تركيبة الباقات (للمستقبل)
- `id`, `name`, `description`
- `flowers_composition` (JSON)
- `original_price`, `current_price`

### 5. **sales** - المبيعات
سجل كامل للمبيعات
- `id`, `item_type`, `item_id`
- `quantity_sold`, `sale_price`, `total_revenue`
- `sale_date`, `customer_notes`

### 6. **waste_stats** - إحصائيات الخردة
تتبع الأزهار المتلفة
- `id`, `flower_id`, `quantity_wasted`
- `waste_date`, `waste_reason`, `estimated_loss`

---

## 🔌 API Routes الرئيسية

### 🌹 Flowers
```
GET    /api/flowers              - الحصول على جميع الأزهار
POST   /api/flowers              - إضافة وردة
GET    /api/flowers/:id          - الحصول على وردة
PUT    /api/flowers/:id/quantity - تحديث الكمية
DELETE /api/flowers/:id          - حذف وردة
```

### 🚨 Alerts
```
GET    /api/alerts               - جميع التنبيهات
GET    /api/alerts/critical      - التنبيهات الحرجة فقط
POST   /api/alerts               - إنشاء تنبيه
PUT    /api/alerts/:id/resolve   - حل التنبيه
PUT    /api/alerts/:id/read      - وضع علامة مقروء
```

### 💰 Pricing
```
GET    /api/pricing              - حصول على السياسات
POST   /api/pricing/apply-discount - تطبيق خصم
GET    /api/pricing/stats/summary  - إحصائيات
```

### 📊 Dashboard
```
GET    /api/dashboard/summary          - ملخص البيانات
GET    /api/dashboard/critical-flowers - أزهار حرجة
GET    /api/dashboard/performance      - الأداء
GET    /api/dashboard/top-alerts       - أهم التنبيهات
```

---

## 🎯 المكونات الأمامية

### 1. **Dashboard**
عرض لوحة تحكم شاملة تتضمن:
- بطاقات إحصائيات (الكمية، الإيرادات، التنبيهات)
- قائمة الأزهار القريبة من التلف
- أحدث التنبيهات

### 2. **FlowerInventory**
إدارة كاملة للمخزون:
- ✅ إضافة أزهار جديدة
- ✅ عرض جدول بجميع الأزهار
- ✅ تحديث الكميات
- ✅ حذف الأزهار

### 3. **Alerts**
نظام إدارة التنبيهات:
- ✅ عرض التنبيهات حسب الأولوية
- ✅ تقسيم بين الحرج والعادي
- ✅ حل التنبيهات يدوياً

### 4. **Pricing**
إدارة التسعير الديناميكي:
- ✅ تطبيق خصومات تلقائية
- ✅ عرض الأزهار المخفضة
- ✅ معاينة السعر الجديد

---

## 🚀 خطوات التشغيل

### المتطلبات
- Node.js v14+
- npm أو yarn

### الخطوات
```bash
# 1. تثبيت المكتبات
cd backend && npm install
cd ../frontend && npm install

# 2. تشغيل Backend
cd backend && npm run dev
# 👇 الخادم يعمل على http://localhost:5000

# 3. في نافذة جديدة، تشغيل Frontend
cd frontend && npm start
# 👇 المتصفح ينفتح على http://localhost:3000
```

---

## 🔐 دوال مساعدة (Utilities)

في `backend/utils/calculations.js`:

```javascript
// حساب تاريخ التلف
calculateDecayDate(entryDate, lifespanDays)

// حساب الأيام المتبقية
calculateDaysUntilDecay(decayDate)

// تحديد حالة الوردة
getFlowerStatus(decayDate)

// حساب الخصم الديناميكي
calculateDynamicDiscount(entryDate, decayDate, maxDiscount)

// حساب السعر الجديد
calculateNewPrice(originalPrice, discountPercentage)

// حساب الربح/الخسارة
calculateProfitLoss(originalPrice, salePrice, quantity)
```

---

## 🎨 التصميم

- **الألوان الأساسية**:
  - 🔵 الأزرق: #667eea (عام)
  - 🔴 الأحمر: #f44336 (حرج)
  - 🟠 البرتقالي: #ff9800 (تحذير)
  - 🟢 الأخضر: #4caf50 (نجاح)

- **استجابي**: يعمل على الهاتف والكمبيوتر

---

## 📝 الملفات المهمة

| الملف | الغرض |
|------|--------|
| `backend/server.js` | نقطة البداية للخادم |
| `backend/db.js` | إنشاء وتهيئة قاعدة البيانات |
| `database/schema.sql` | تعريف جميع الجداول |
| `frontend/src/App.js` | التطبيق الرئيسي |
| `frontend/src/components/Dashboard.js` | لوحة التحكم |

---

## 🔄 دورة الحياة

```
1. إضافة وردة جديدة
   ↓
2. النظام يحسب تاريخ التلف تلقائياً
   ↓
3. كلما اقتربت من التلف → تنبيه تلقائي
   ↓
4. تطبيق خصم ديناميكي
   ↓
5. تسجيل المبيعات
   ↓
6. عرض الإحصائيات والأرباح
```

---

## 🚧 المرحلة التالية

قريباً:
- [ ] نموذج AI لتوصيات الباقات
- [ ] تصدير التقارير PDF/Excel
- [ ] نسخ احتياطية تلقائية
- [ ] تطبيق موبايل native
- [ ] نظام مستخدمين متقدم

---

**تاريخ الإنشاء**: 2024-03-01
**الحالة**: 🟢 Prototype جاهز للاستخدام
