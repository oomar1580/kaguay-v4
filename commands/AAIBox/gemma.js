import axios from "axios";
import tinyurl from "tinyurl";
import fs from "fs";
import path from "path";
import { process } from "process";

export default {
  name: "i2art",
  author: "حسين يعقوبي",
  role: "user",
  description: "تحويل الصورة إلى فن رقمي عبر URL",
  execute: async ({ api, event, args }) => {
    const text = args.join(" ");

    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return api.sendMessage("❌ | من فضلك قم بالرد على صورة.", event.threadID, event.messageID);
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    const lado = `https://c-v3.onrender.com/i2art?url=${imgurl}`;

    // تحديد المسار لحفظ الملف داخل مجلد cache
    const cacheDir = path.join(process.cwd(), "cache");
    const filePath = path.join(cacheDir, `art_${event.senderID}_${Date.now()}.png`);

    try {
      // الحصول على الرابط المختصر
      const shortUrl = await tinyurl.shorten(lado);

      // الطلب لجلب الصورة الفنية الناتجة وحفظها في cache
      const response = await axios({
        url: lado,
        method: "GET",
        responseType: "stream"
      });

      // التأكد من وجود مجلد cache
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // حفظ الصورة الناتجة في ملف محلي داخل cache
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      // انتظار انتهاء عملية الكتابة
      writer.on("finish", () => {
        // إرسال رسالة تأكيد التوليد مع الصورة والرابط المختصر
        api.sendMessage({
          body: `❍───────────────❍\n🎨 | 𝐷𝑂𝑁𝐸 𝑆𝑈𝐶𝐶𝐸𝑆𝑆𝐹𝑈𝐿𝐿𝑌 \n🔗 | link :${shortUrl} \n❍───────────────❍',
        `,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
          // إضافة علامة نجاح التوليد
          api.setMessageReaction("✅", event.messageID, () => {}, true);

          // حذف الملف بعد إرساله
          fs.unlinkSync(filePath);
        });
      });

      writer.on("error", (err) => {
        console.error("Error writing file:", err);
        api.sendMessage("❌ | فشل في حفظ الملف.", event.threadID, event.messageID);
      });
    } catch (error) {
      // التعامل مع الخطأ في حالة فشل التوليد
      api.sendMessage("❌ | فشل في توليد الفن، الرجاء المحاولة مرة أخرى.", event.threadID, event.messageID);
      console.error("Error generating art:", error);
    }
  }
};
