import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "الرمز",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "عرض أو تعديل بادئة المجموعة",
  role: "member",
  aliases: ["prefix", "Prefix", "البادئة"],
  execute: async ({ event, api }) => {
    
    api.setMessageReaction("❓", event.messageID, (err) => {}, true);
  
    // رسالة "لا توجد أي بادئة" مع مرفق GIF سيتم إرسالها مباشرة
    const noPrefixMessage = "🧭 | ᴛʜᴇʀᴇ ɪѕ ɴᴏ ᴘʀᴇғɪх";
    const videoLink = 'https://i.ibb.co/T2SV06R/download.gif'; // الرابط الخاص بالـ GIF

    // مسار مجلد مؤقت لتخزين الصورة المتحركة
    const tmpFolderPath = path.join(process.cwd(), 'tmp');

    // إنشاء المجلد إذا لم يكن موجودًا
    if (!fs.existsSync(tmpFolderPath)) {
      fs.mkdirSync(tmpFolderPath);
    }

    // مسار تخزين الـ GIF محليًا
    const gifPath = path.join(tmpFolderPath, 'owner_video.gif');

    try {
      // جلب الـ GIF من الرابط وحفظه
      const gifResponse = await axios.get(videoLink, { responseType: 'arraybuffer' });
      fs.writeFileSync(gifPath, Buffer.from(gifResponse.data, 'binary'));

      // إرسال الرسالة مع الـ GIF
      await sendNoPrefixMessage(api, event.threadID, noPrefixMessage, gifPath);
    } catch (error) {
      console.error("Error fetching and sending GIF:", error);
      api.sendMessage("❌ | حدث خطأ أثناء تحميل أو إرسال ملف الـ GIF.", event.threadID);
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
