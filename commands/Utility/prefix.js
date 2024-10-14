import fs from "fs";
import path from "path";

export default {
  name: "الرمز",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "عرض أو تعديل بادئة المجموعة",
  role: "member",
  aliases: ["prefix", "Prefix", "البادئة"],
  execute: async ({ event, api }) => {
    // رسالة "لا توجد أي بادئة" مع مرفق GIF سيتم إرسالها مباشرة
    const noPrefixMessage = "🧭 | لاتـوجـد أي بادئـة";
    const gifPath = path.join(process.cwd(), "cache12", "welcom.gif");

    // إرسال الرسالة مع GIF مباشرة
    await sendNoPrefixMessage(api, event.threadID, noPrefixMessage, gifPath);
  },
};

// دالة إرسال رسالة مع GIF
async function sendNoPrefixMessage(api, threadID, message, attachmentPath) {
  try {
    // التحقق من وجود ملف الـ GIF
    if (!fs.existsSync(attachmentPath)) {
      return api.sendMessage("❌ | ملف الـ GIF غير موجود في المسار المحدد.", threadID);
    }
    
    api.setMessageReaction("❓", event.messageID, (err) => {}, true);
  

    // قراءة ملف الـ GIF كـ stream وإرساله مع الرسالة
    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(attachmentPath),
    }, threadID);
  } catch (error) {
    console.error("Error sending no prefix message:", error);
  }
}
