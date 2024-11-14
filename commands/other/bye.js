import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "الوداع",
  author: "HUSSEIN YACOUBI",
  cooldowns: 60,
  description: "رسالة توديع الى شخص غادر المجموعة",
  role: "member",
  aliases: ["وداعا", "إلى اللقاء", "باي", "bye"],
  execute: async ({ event, api }) => {
    
    api.setMessageReaction("🚮", event.messageID, (err) => {}, true);
  
    // رسالة "لا توجد أي بادئة" مع مرفق GIF سيتم إرسالها مباشرة
    const noPrefixMessage = "";
    const videoLink = 'https://i.imgur.com/jpRhE5h.mp4'; // الرابط الخاص بالـ GIF

    // مسار مجلد مؤقت لتخزين الصورة المتحركة
    const tmpFolderPath = path.join(process.cwd(), 'tmp');

    // إنشاء المجلد إذا لم يكن موجودًا
    if (!fs.existsSync(tmpFolderPath)) {
      fs.mkdirSync(tmpFolderPath);
    }

    // مسار تخزين الـ GIF محليًا
    const gifPath = path.join(tmpFolderPath, 'bye_video.mp4');

    try {
      // جلب الـ GIF من الرابط وحفظه
      const gifResponse = await axios.get(videoLink, { responseType: 'arraybuffer' });
      fs.writeFileSync(gifPath, Buffer.from(gifResponse.data, 'binary'));

      // إرسال الرسالة مع الـ GIF
      await sendNoPrefixMessage(api, event.threadID, noPrefixMessage, gifPath);
    } catch (error) {
      console.error("Error fetching and sending GIF:", error);
      api.sendMessage("❌ | حدث خطأ أثناء تحميل أو إرسال ملف الـ الفيديو.", event.threadID);
    }
  },
};

// دالة إرسال رسالة مع GIF
async function sendNoPrefixMessage(api, threadID, message, attachmentPath) {
  try {
    // إرسال الرسالة مع ملف الـ GIF
    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(attachmentPath),
    }, threadID);
  } catch (error) {
    console.error("Error sending no prefix message:", error);
  }
}
