import fs from "fs";
import path from "path";

export default {
  name: "الرمز",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "عرض أو تعديل بادئة المجموعة",
  role: "member",
  aliases: ["prefix", "Prefix", "البادئة"],
  execute: async ({ event, Threads, args, api }) => {
    if (!event.isGroup) {
      return api.sendMessage(" ⚠️ | لا يمكن استخدام هذا الأمر إلا في مجموعات!", event.threadID);
    }

    const getThread = await Threads.find(event.threadID);

    const responses = {
      true: async () => {
        if (args[0]) {
          // تحديث البادئة في المجموعة
          await Threads.update(event.threadID, { prefix: args[0] });
          api.sendMessage("✅ | تم تغيير بادئة مجموعتك إلى: " + args[0], event.threadID);
        } else {
          api.sendMessage("🧭 | البادئة الحالية لمجموعتك هي: " + getThread.prefix, event.threadID);
        }
      },
      false: async () => {
        // إرسال رسالة عدم وجود بادئة مع GIF
        const noPrefixMessage = "🧭 | ᴛʜᴇʀᴇ ɪѕ ɴᴏ ᴘʀᴇғɪх\n 🧭 | لاتـوجـد أي بادئـة";
        const gifPath = path.join(process.cwd(), "cache12", "welcom.gif");
        await sendNoPrefixMessage(api, event.threadID, noPrefixMessage, gifPath);
      },
    };

    responses[getThread?.status || false]();
  },
};

// دالة إرسال رسالة عدم وجود بادئة مع GIF
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
