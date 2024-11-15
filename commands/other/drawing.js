import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function translateToEnglish(text) {
  const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
  return translationResponse?.data?.[0]?.[0]?.[0];
}

export default {
  name: "ارسمي2",
  author: "HUSSEIN YACOUBI",
  role: "member",
  description: "🔮توليد صور على شكل انمي بإستخدام الذكاء الاصطناعي",
  aliases: ["ani"],
  execute: async ({ api, event, args }) => {
    try {
      // التحقق من وجود الوصف
      const prompt = args.join(" ");
      if (!prompt) {
        return api.sendMessage("⚠️ | قم بتقديم وصف بعد الأمر من أجل توليد صور انمي بإستخدام الذكاء الإصطناعي", event.threadID);
      }

      // إضافة تفاعل يشير إلى بدء المعالجة
      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      // ترجمة الوصف إلى الإنجليزية إذا كان بالعربية
      const translatedPrompt = await translateToEnglish(prompt);

      // حساب وقت التوليد
      const startTime = new Date().getTime();

      // استدعاء API لتوليد الصورة
      const baseURL = `https://c-v5.onrender.com/api/ani`;
      const response = await axios.get(baseURL, {
        params: { prompt: translatedPrompt },
        responseType: 'stream'
      });

      const endTime = new Date().getTime();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

      // إرسال رسالة أولية للحصول على معرف الرسالة للتعديل لاحقاً
      const initialMessage = await api.sendMessage("⏳ جـارٍ تـولـيـد وصـفـك...", event.threadID);

      // تعديل الرسالة الأولية لإظهار تقدم التحميل
      setTimeout(() => api.editMessage("████▒▒▒▒▒▒ 31%", initialMessage.messageID), 500);
      setTimeout(() => api.editMessage("██████▒▒▒▒ 59%", initialMessage.messageID), 1000);
      setTimeout(() => api.editMessage("███████▒▒▒ 73%", initialMessage.messageID), 1500);
      setTimeout(() => api.editMessage("█████████▒ 88%", initialMessage.messageID), 2000);
      setTimeout(() => api.editMessage("██████████ 100%", initialMessage.messageID), 2500);

      // تعريف مسار الملف
      const fileName = 'anime-x-image.png';
      const filePath = path.join(process.cwd(), 'cache', fileName);
      const writerStream = fs.createWriteStream(filePath);

      // تخزين الصورة
      response.data.pipe(writerStream);

      writerStream.on('finish', async () => {
        // حذف رسالة التقدم بعد انتهاء التحميل
        api.unsendMessage(initialMessage.messageID);

        // إرسال الرسالة النهائية مع الصورة
        await api.sendMessage({
          body: `✅ | تــم بــنــجــاح\n\n⚙️ | البــرومــبــت: ${prompt}\n⏱️ | الــوقــت: ${timeTaken} ث`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        // إضافة تفاعل للإشارة إلى اكتمال العملية
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        
        // حذف الصورة بعد الإرسال
        fs.unlinkSync(filePath);
      });

      writerStream.on('error', async (error) => {
        console.error('Error writing file:', error);
        api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الصورة.", event.threadID);
      });

    } catch (error) {
      console.error('Error generating image:', error);
      api.sendMessage("❌ | فشل التوليد، ربما تكون المشكلة من الخادم.", event.threadID);
    }
  }
};
