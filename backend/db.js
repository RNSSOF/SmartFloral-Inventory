const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'smartfloral.db');

// تهيئة قاعدة البيانات
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  } else {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    initializeDatabase();
  }
});

// قراءة وتنفيذ schema
function initializeDatabase() {
  // schema.sql lives in the project root's database folder
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // تقسيم الأوامر على أساس النقطة والفاصلة
  const commands = schema
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  let completed = 0;

  commands.forEach((command) => {
    db.run(command, (err) => {
      if (err) {
        console.error('خطأ في تنفيذ الأمر:', err.message);
      } else {
        completed++;
        if (completed === commands.length) {
          console.log('✅ تم إعداد قاعدة البيانات بنجاح');
          logDatabaseInfo();
        }
      }
    });
  });
}

// عرض معلومات قاعدة البيانات
function logDatabaseInfo() {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('خطأ:', err.message);
      return;
    }
    console.log('\n📊 الجداول المنشأة:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
  });
}

module.exports = db;
