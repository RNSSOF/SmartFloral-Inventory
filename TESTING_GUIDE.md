# 💡 نصائح واختبارات SmartFloral Inventory

## 🧪 اختبار النظام

### 1️⃣ اختبار الخادم

```bash
# تحقق من حالة الخادم
curl http://localhost:5000/api/health
```

**الرد المتوقع**:
```json
{"status": "Server is running ✅"}
```

### 2️⃣ إضافة أول وردة

```bash
curl -X POST http://localhost:5000/api/flowers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "وردة حمراء راقية",
    "type": "حمراء",
    "supplier": "مزرعة الورد",
    "quantity": 50,
    "original_price": 5.99,
    "expected_lifespan_days": 7
  }'
```

### 3️⃣ الحصول على جميع الأزهار

```bash
curl http://localhost:5000/api/flowers
```

### 4️⃣ الحصول على لوحة التحكم

```bash
curl http://localhost:5000/api/dashboard/summary
```

---

## 🎯 حالات الاستخدام الشائعة

### ✅ سيناريو 1: إضافة وردة وتطبيق خصم

```bash
# 1. أضف الوردة
RESPONSE=$(curl -s -X POST http://localhost:5000/api/flowers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "وردة زهرية",
    "type": "زهري",
    "supplier": "مزرعة الزهور",
    "quantity": 30,
    "original_price": 3.50,
    "expected_lifespan_days": 5
  }')

# 2. استخرج معرّف الوردة من الرد
FLOWER_ID=$(echo $RESPONSE | grep -o '"flower_id":"[^"]*' | cut -d'"' -f4)

echo "معرّف الوردة: $FLOWER_ID"

# 3. تطبيق خصم
curl -X POST http://localhost:5000/api/pricing/apply-discount \
  -H "Content-Type: application/json" \
  -d "{
    \"flower_id\": \"$FLOWER_ID\",
    \"discount_percentage\": 20,
    \"reason\": \"قريبة من التلف\"
  }"
```

### ✅ سيناريو 2: تسجيل مبيعة

```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "item_type": "flower",
    "item_id": "your-flower-id-here",
    "quantity_sold": 10,
    "sale_price": 4.79,
    "customer_notes": "عميل VIP"
  }'
```

### ✅ سيناريو 3: إنشاء تنبيه يدوي

```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "flower_id": "your-flower-id-here",
    "alert_type": "low_stock",
    "message": "مخزون منخفض من الورد الأحمر",
    "severity": "high"
  }'
```

---

## 🔍 تصحيح الأخطاء (Debugging)

### مشكلة: الخادم لا يستجيب

```bash
# تحقق من أن الخادم يعمل
lsof -i :5000

# إذا كان يعمل، اقتل العملية وأعد التشغيل
kill -9 <PID>
```

### مشكلة: خطأ قاعدة البيانات

```bash
# حذف قاعدة البيانات القديمة وأعد الإنشاء
rm database/smartfloral.db
node backend/db.js
```

### مشكلة: CORS errors

تأكد من أن Backend يسمح بـ CORS (الملف: `backend/server.js` يحتوي على الإعدادات)

---

## 📊 البيانات الوهمية (Test Data)

### البيانات الأولية الموصى بها

```json
[
  {
    "name": "وردة حمراء فخمة",
    "type": "حمراء فخمة",
    "supplier": "مزرعة النيل",
    "quantity": 100,
    "original_price": 8.50,
    "expected_lifespan_days": 7
  },
  {
    "name": "وردة بيضاء ناعمة",
    "type": "بيضاء",
    "supplier": "مزرعة الجزيرة",
    "quantity": 75,
    "original_price": 6.00,
    "expected_lifespan_days": 8
  },
  {
    "name": "وردة زهرية وردي",
    "type": "زهري",
    "supplier": "مزرعة الزهور",
    "quantity": 60,
    "original_price": 4.50,
    "expected_lifespan_days": 6
  },
  {
    "name": "وردة صفراء مشعة",
    "type": "صفراء",
    "supplier": "مزرعة الشمس",
    "quantity": 50,
    "original_price": 5.00,
    "expected_lifespan_days": 7
  },
  {
    "name": "وردة برتقالية دافئة",
    "type": "برتقالية",
    "supplier": "مزرعة النيل",
    "quantity": 45,
    "original_price": 5.50,
    "expected_lifespan_days": 6
  }
]
```

---

## 💾 النسخ الاحتياطية

### عمل نسخة احتياطية من قاعدة البيانات

```bash
# على Linux/Mac
cp database/smartfloral.db database/smartfloral.db.backup.$(date +%Y%m%d_%H%M%S)

# على Windows PowerShell
Copy-Item "database/smartfloral.db" "database/smartfloral.db.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
```

---

## 🔐 متغيرات البيئة

في `backend/.env`:

```env
PORT=5000                           # منفذ الخادم
NODE_ENV=development               # بيئة التطوير
DB_PATH=./database/smartfloral.db   # مسار قاعدة البيانات
```

---

## 📈 مراقبة الأداء

### مراقبة استهلاك الذاكرة

```bash
# على Linux/Mac
node --max-old-space-size=4096 backend/server.js

# أو استخدم PM2
pm2 start backend/server.js --name "SmartFloral"
pm2 monit
```

---

## 🎓 تعلم إضافي

### الملفات المهمة للدراسة

1. **backend/routes/flowers.js** - كيفية بناء API endpoint
2. **backend/utils/calculations.js** - الحسابات والمنطق
3. **frontend/src/components/Dashboard.js** - استهلاك API من React
4. **database/schema.sql** - تصميم قاعدة البيانات

---

## 🚀 التطوير المستقبلي

### أفكار للتحسين

- [ ] إضافة نموذج ML لتنبؤ المبيعات
- [ ] إرسال إشعارات عبر البريد الإلكتروني
- [ ] نسخ احتياطية تلقائية يومية
- [ ] رسوم بيانية تفاعلية أكثر
- [ ] تطبيق موبايل React Native

---

**نصيحة فذة**: اقرأ `backend/routes/flowers.js` و `database/schema.sql` لفهم الهيكل بشكل أعمق 🚀
