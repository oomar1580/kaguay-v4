import axios from "axios";
import fs from "fs-extra";
import path from "path";

export default {
  name: "هاك",
  author: "Your Name",
  role: "member",
  description: "قم بعمل هاك ل شخص عن طريق إنشاء صورة معالجة.",
  execute: async ({ api, event }) => {
    let chilli;
    let pogi;
    const bundat = event.senderID;

    // التحقق من ما إذا كان المستخدم قد رد على شخص أو قام بذكر شخص
    if (event.messageReply) {
      chilli = event.messageReply.senderID;
      pogi = (await api.getUserInfo([chilli]))[chilli].name;
    } else if (Object.keys(event.mentions).length > 0) {
      chilli = Object.keys(event.mentions)[0];
      pogi = (await api.getUserInfo([chilli]))[chilli].name;
    } else {
      return api.sendMessage("👩‍💻 | قـم بالـرد أو إعـمـل مـنـشـن ", event.threadID, event.messageID);
    }

    const bilat = (await api.getUserInfo([bundat]))[bundat].name;

    // إرسال رسالة مؤقتة للمعالجة
    const pangit = await new Promise((resolve, reject) => {
      api.sendMessage(`👩‍💻 | جـارٍ مـعـالـجـة الـهـاك لـ ${pogi}...`, event.threadID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      }, event.messageID);
    });

    try {
      // استدعاء API لتوليد صورة "القرصنة" باستخدام الرابط الجديد
      const apiUrl = `https://api-canvass.vercel.app/hack?name=${encodeURIComponent(pogi)}&uid=${chilli}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const imagePath = path.join(process.cwd(), 'cache', 'hack.jpg');
      await fs.writeFile(imagePath, Buffer.from(response.data, 'binary'));

      // إرسال الصورة مع الرسالة
      const msgOptions = {
        body: `👩‍💻 | تـم تـهـكـيـر ${pogi} بـنـجـاح`,
        attachment: fs.createReadStream(imagePath)
      };

      await api.sendMessage(msgOptions, event.threadID);

      // حذف الصورة بعد الإرسال
      await fs.unlink(imagePath);
      
      // إزالة رسالة المعالجة المؤقتة
      api.unsendMessage(pangit.messageID);

    } catch (error) {
      console.error('Error:', error);
      // تعديل الرسالة المؤقتة إذا حدث خطأ
      await api.editMessage("❌ فشلت معالجة طلب القمامة. حاول مرة أخرى.", pangit.messageID);
    }
  }
};
