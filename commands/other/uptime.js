import moment from "moment-timezone";
import axios from "axios";
import fs from "fs-extra";
import path from "path";

export default {
  name: "بيانات",
  author: "Kaguya Project",
  cooldowns: 60,
  description: "بيانات البوت",
  role: "member",
  aliases: ["مدة_التشغيل"],
  execute: async ({ args, api, event }) => {
    
    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);
  
    // الحصول على التاريخ والوقت بشكل منفصل
    const currentDate = moment().tz('Africa/Casablanca').format('YYYY-MM-DD');
    const currentTime = moment().tz('Africa/Casablanca').format('hh:mm:ss A');

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime - (hours * 3600)) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `البوت كان شغالا منذ ${hours} ساعة ، ${minutes} دقيقة ، و ${seconds} ثانية`;

    const threads = await api.getThreadList(99999, null, ['INBOX']);
    let userCount = 0;
    let groupCount = 0;

    threads.forEach(thread => {
      if (thread.isGroup) {
        groupCount++;
      } else {
        userCount++;
      }
    });

    const output = `🤖 |حالة البوت\n\n` +
      `التاريخ اليوم 📅: ${currentDate}\n` +
      `الوقت الحالي ⏰: ${currentTime}\n` +
      `إجمالي عدد المستخدمين 🧿: ${userCount}\n` +
      `إجمالي عدد المجموعات 🗝️: ${groupCount}\n\n` +
      `${uptimeStr}`;

    // إعداد رابط API مع المتغيرات
    const apiUrl = `https://ajiro-rest-api.gleeze.com/api/uptime?instag=@hussein_yacoubi&ghub=@HUSSEINHN123&fb=@HUSSEIN YACOUBI&hours=${hours}&minutes=${minutes}&seconds=${seconds}&botname=KAGUYA`;

    try {
      // طلب الصورة من API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // مسار حفظ الصورة
      const imagePath = path.join(process.cwd(), "cache", "uptime.jpg");

      // حفظ الصورة في ملف
      fs.writeFileSync(imagePath, response.data);

      // إرسال الرسالة مع الصورة كملف مرفق
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);
  
      api.sendMessage(
        { body: output, attachment: fs.createReadStream(imagePath) },
        event.threadID,
        () => fs.unlinkSync(imagePath) // حذف الملف بعد الإرسال
      );
    } catch (error) {
      console.error("Error fetching uptime image:", error);
      api.sendMessage("حدث خطأ أثناء جلب صورة حالة البوت.", event.threadID);
    }
  }
};
