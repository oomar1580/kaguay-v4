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
    const senderID = event.senderID;
    

    // طلب من المستخدم إدخال البرومبت أولاً
    api.sendMessage("\n\t\t〖𝙸𝙼𝙰𝙶𝙸𝙽𝙰𝚃𝙸𝙾𝙽 𝚂𝙴𝙲𝚃𝙸𝙾𝙽〗\n👥 | من فضلك أدخل النص (البرومبت) الذي تريد تحويله إلى صورة:", event.threadID, (err, message) => {
      global.client.handler.reply.set(message.messageID, {
        author: senderID,
        type: "textPrompt",
        name: "تخيلي",
        collectedData: {},
        unsend: true
      });
    });
  },

      api.setMessageReaction("🕐", event.messageID, (err) => {}, true);


  onReply: async ({ api, event, reply }) => {
    if (reply.author !== event.senderID) return; // التحقق من أن المستخدم هو نفسه
    const messageBody = event.body.trim();

    try {
      // ترجمة النص إلى الإنجليزية (إذا لزم الأمر)
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(messageBody)}`);
      if (!translationResponse || !translationResponse.data || !translationResponse.data[0] || !translationResponse.data[0][0]) {
        api.sendMessage("⚠️ | فشل في ترجمة النص.", event.threadID, event.messageID);
        return;
      }
      const translatedPrompt = translationResponse.data[0][0][0];

      // جلب الصورة باستخدام رابط الـ API الجديد
      const apiUrl = `https://jerome-web.gleeze.com/service/api/bing?prompt=${encodeURIComponent(translatedPrompt)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.success || !response.data.result || response.data.result.length === 0) {
        api.sendMessage("فشل في استرجاع الصورة.", event.threadID, event.messageID);
        return;
      }

      const imageUrl = response.data.result[0]; // جلب صورة واحدة فقط
      const downloadDirectory = path.join(process.cwd(), 'cache');
      fs.ensureDirSync(downloadDirectory);
      const filePath = path.join(downloadDirectory, `${Date.now()}.jpg`);

      // تحميل الصورة وحفظها
      const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
      const fileStream = fs.createWriteStream(filePath);
      imageResponse.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        fileStream.close();
        const now = moment().tz("Africa/Casablanca");
        const timeString = now.format("HH:mm:ss");
        const dateString = now.format("YYYY-MM-DD");

        api.getUserInfo(event.senderID, async (err, userInfo) => {
          if (err) {
            console.log(err);
            api.sendMessage("⚠️ | حدث خطأ أثناء جلب معلومات المستخدم.", event.threadID, event.messageID);
            return;
          }

          const userName = userInfo[event.senderID].name;
          const messageBody = `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`;

          // تفاعل مع الرسالة وأرسل الصورة
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });
      });

      fileStream.on('error', (error) => {
        api.sendMessage("❌ | حدث خطأ أثناء تنزيل الصورة. يرجى المحاولة لاحقًا.", event.threadID, event.messageID);
        console.error("خطأ في تنزيل الصورة:", error);
      });
    } catch (error) {
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
      console.error("خطأ أثناء معالجة الطلب:", error);
    }
  }
};
