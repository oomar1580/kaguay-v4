import path from 'path';
import fs from 'fs';

// دالة للحصول على مسار ملف الفيديو أو الصورة
async function getGreetingImage() {
  const imagePath = path.join(process.cwd(), 'cache12', 'box.mp4'); // تعديل المسار حسب الحاجة
  return fs.createReadStream(imagePath);
}

export default {
  name: "أصنام",
  author: "البوت",
  role: "member",
  aliases: ["هدوء", "صمت"],
  description: "يرسل رسالة ترحيبية مع صورة.",
  
  execute: async function({ api, event }) {
    try {
      // الحصول على ملف الفيديو من المسار
      const greetingImageStream = await getGreetingImage();

      // إضافة رد فعل (reaction) على الرسالة الأصلية
      api.setMessageReaction("😴", event.messageID, (err) => {}, true);

      // إرسال الرسالة مع الفيديو أو الصورة
      api.sendMessage({
        body: "✧───────────────✧\n\t\tهيا يا أصنام قولو شيئا🥱\n✧───────────────✧",
        attachment: greetingImageStream
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error('Error sending greeting message:', error);
      api.sendMessage('❌ | حدث خطأ أثناء إرسال الرسالة الترحيبية.', event.threadID, event.messageID);
    }
  }
};
