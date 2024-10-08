import axios from "axios";
import fs from "fs-extra";
import path from "path";

async function boardAlert({ api, event, args }) {
  try {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("⚠️ | يرجى إدخال نص لتوليد الصورة.\nمثال: آينشتاين الحكمة", threadID, messageID);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = path.join(process.cwd(), 'cache', `${timestamp}_einstein.png`);

    // إضافة رد فعل للإشارة إلى بدء العملية
    api.setMessageReaction("⏱️", event.messageID, () => {}, true);

    // استخدام الرابط الجديد لجلب صورة أينشتاين مع النص
    const response = await axios.get(`https://api-canvass.vercel.app/einstein?text=${encodeURIComponent(query)}`, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

    // تغيير رد الفعل للإشارة إلى نجاح العملية
    api.setMessageReaction("📜", event.messageID, () => {}, true);

    // إرسال الصورة بعد 5 ثواني ثم حذفها
    setTimeout(function () {
      api.sendMessage({
        body: "",
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        setTimeout(() => {
          fs.unlinkSync(imagePath);
        }, 5 * 1000);
      }, messageID);
    }, 5 * 1000);
  } catch (error) {
    console.error(error);
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
}

export default {
  name: "آينشتاين",
  author: "kaguya project",
  description: "يرسل صورة أينشتاين مع النص المقدم.\nمثال: آينشتاين الحكمة",
  aliases: [""],
  execute: boardAlert
};
