import fs from 'fs';
import path from 'path';


export default {
  name: "تحية-تلقائية",
  author: "Hussein Yacoubi",
  role: "admin", // فقط للمسؤولين
  description: "تشغيل أو إيقاف الميزة من التحية التلقائية",
  execute({ api, event }) {
    const configPath = path.join(process.cwd(), 'config.js');
    
    // تحميل ملف config.js الحالي
    let config = require(configPath);

    // تبديل حالة الميزة
    config.autogreet = !config.autogreet;

    // تعديل الملف باستخدام JSON.stringify لتحديث قيمة featureEnabled
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)};`);

    // إرسال رسالة للمستخدم لتأكيد التبديل
    api.sendMessage(' ${config.featureEnabled ? '✅' : '❌'} `, event.threadID, event.messageID);
  }
};
