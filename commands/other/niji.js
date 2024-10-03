import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { shorten } from 'tinyurl';

export default {
  name: "نيجي",
  author: "kaguya project",
  role: "member",
  aliases: ["xl"],
  description: "توليد صورة أنمي بناء على النص المعطى.",
  async execute({ message, event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    const input = args.join(' ');
    const [prompt, resolution = '1:1'] = input.split('|').map(s => s.trim());

    if (!prompt) {
      return api.sendMessage("❌ | الرجاء إدخال النص.", event.threadID, event.messageID);
    }

    try {
      // ترجمة النص إلى الإنجليزية
      const translatedPrompt = await translateToEnglish(prompt);

      // معامل الأبعاد الافتراضي
      const ratioParam = `&ratio=2:3`;

      // رابط الأساسي للخدمة مع المعاملات
      const apiUrl = `https://team-calyx.onrender.com/gen?prompt=${encodeURIComponent(translatedPrompt)}${ratioParam}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      // تحديد مسار حفظ الصورة مؤقتاً
      const imagePath = path.join(process.cwd(), "cache", `${Date.now()}_generated_image.png`);
      
      // حفظ الصورة محليًا من الـ stream
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      // عند الانتهاء من تحميل الصورة
      writer.on('finish', async () => {
        const stream = fs.createReadStream(imagePath);

        // تقصير رابط الصورة باستخدام tinyurl
        shorten(apiUrl, async function (shortUrl) {
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          await api.sendMessage({
            body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n✅ |تــــم تـــولـــيــد الــصــورة بــنــجــاح\n📎 | رابط الصورة  ${shortUrl} \n◆❯━━━━━▣✦▣━━━━━━❮◆`,
            attachment: stream
          }, event.threadID, event.messageID);
        });

        // حذف الصورة المؤقتة بعد الإرسال
        await fs.remove(imagePath);
      });

      // في حال وجود خطأ أثناء تحميل الصورة
      writer.on('error', async (err) => {
        console.error('خطأ في تحميل الصورة:', err);
        api.sendMessage("❌ | حدث خطأ أثناء تحميل الصورة.", event.threadID, event.messageID);
        await fs.remove(imagePath); // حذف الصورة المؤقتة
      });

    } catch (error) {
      console.error('خطأ في إرسال الصورة:', error);
      api.sendMessage("❌ | حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    } finally {
      api.setMessageReaction("", event.messageID, (err) => {}, true);
    }
  }
};

async function translateToEnglish(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error("خطأ في ترجمة النص:", error);
    return text; // إرجاع النص كما هو في حالة وجود خطأ في الترجمة
  }
}
