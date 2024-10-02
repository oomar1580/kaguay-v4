import axios from "axios";
import path from "path";
import fs from "fs-extra";
import moment from "moment-timezone";

export default {
  name: "تخيلي",
  author: "مشروع كاغويا",
  role: "member",
  aliases: ["dalle", "تخيل"],
  description: "توليد صورة بناءً على النص المدخل.",

  execute: async function ({ api, event }) {
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

    const args = event.body.split(" ");
    let prompt = args.join(" ");

    if (!prompt || prompt.trim().length === 0) {
      api.sendMessage("⚠️ | يرجى إدخال نص لتحويله إلى صورة.", event.threadID, event.messageID);
      return;
    }

    try {
      // ترجمة النص من العربية إلى الإنجليزية
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      if (!translationResponse || !translationResponse.data || !translationResponse.data[0] || !translationResponse.data[0][0]) {
        api.sendMessage("⚠️ | فشل في ترجمة النص.", event.threadID, event.messageID);
        return;
      }
      prompt = translationResponse.data[0][0][0];

      const apiUrl = `https://www.samirxpikachu.run.place/sd3-medium?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (!response.data) {
        api.sendMessage("فشل في استرجاع الصورة.", event.threadID, event.messageID);
        return;
      }

      // ضمان وجود مجلد cache
      const downloadDirectory = path.join(process.cwd(), 'cache');
      fs.ensureDirSync(downloadDirectory);
      const filePath = path.join(downloadDirectory, `${Date.now()}.jpg`);

      const fileStream = fs.createWriteStream(filePath);
      response.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        fileStream.close();  // إغلاق التدفق
        const now = moment().tz("Africa/Casablanca");
        const timeString = now.format("HH:mm:ss");
        const dateString = now.format("YYYY-MM-DD");
        const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

        api.getUserInfo(event.senderID, async (err, userInfo) => {
          if (err) {
            console.log(err);
            api.sendMessage("⚠️ | حدث خطأ أثناء جلب معلومات المستخدم.", event.threadID, event.messageID);
            return;
          }
          const userName = userInfo[event.senderID].name;
          const messageBody = `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n\t\t࿇ ══━━✥◈✥━━══ ࿇`;

          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });
      });

      fileStream.on('error', (error) => {
        api.sendMessage("❌ | حدث خطأ أثناء تنزيل الصورة. يرجى المحاولة لاحقًا.", event.threadID, event.messageID);
        api.unsendMessage(event.messageID); // حذف رسالة الانتظار
        console.error("خطأ في تنزيل الصورة:", error);
      });
    } catch (error) {
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
      console.error("خطأ أثناء معالجة الطلب:", error);
    }
  }
};
