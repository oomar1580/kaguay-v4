import axios from 'axios';
import path from 'path';  // لإدارة المسارات
import fs from 'fs-extra'; // للتعامل مع الملفات

export default {
  name: "فيسبوك",
  author: "حسين يعقوبي",
  role: "member",
  description: "تنزيل فيديو من Facebook باستخدام URL.",
  aliases: ["fb"],

  async execute({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage("⚠️ | لم يتم توفير أي رابط. الاستخدام: /fb <URL>", event.threadID);
      }

      const downloadingMsg = await api.sendMessage("⏳ | جاري تنزيل الفيديو...", event.threadID);

      const link = args[0]; // نفترض أن الرابط هو أول مدخل
      const url = 'https://getindevice.com/wp-json/aio-dl/video-data/';
      const payload = {
        url: link,
        token: 'e07a532f5d19affd23559c7339eecaad68fc958d05fc18c7f1512b8485570b28'
      };

      const response = await axios.post(url, payload);
      const media = response.data.medias.length > 1 ? response.data.medias.slice(-1)[0] : response.data.medias[0];

      if (media.extension === 'mp4') {
        const message = `✅ | تم التنزيل بنجاح:\n❀ العنوان: ${response.data.title}\n❀ المدة: ${response.data.duration}\n❀ المصدر: ${response.data.source}\n❀ الحجم: ${media.formattedSize}`;

        // حذف رسالة الانتظار بعد التنزيل
        await api.unsendMessage(downloadingMsg.messageID);

        // إنشاء مسار التخزين المؤقت
        const videoPath = path.join(process.cwd(), 'cache', `${response.data.title.replace(/[^\w\s]/gi, '')}.mp4`);
        fs.ensureDirSync(path.join(process.cwd(), 'cache')); // التأكد من وجود مجلد التخزين المؤقت

        // تحميل الفيديو إلى المسار المؤقت
        const videoStream = await axios({
          method: 'GET',
          url: media.url,
          responseType: 'stream'
        });

        const fileWriteStream = fs.createWriteStream(videoPath);
        videoStream.data.pipe(fileWriteStream);

        fileWriteStream.on('finish', async () => {
          // إرسال الفيديو بعد الانتهاء من تحميله
api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
          await api.sendMessage({
            body: message,
            attachment: fs.createReadStream(videoPath)
          }, event.threadID);

          // حذف الملف بعد الإرسال
          fs.unlinkSync(videoPath);
        });

        fileWriteStream.on('error', (error) => {
          console.error('[ERROR] أثناء كتابة الملف:', error);
          api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", event.threadID);
        });

      } else {
        await api.unsendMessage(downloadingMsg.messageID);
        api.sendMessage("⚠️ | لا يوجد فيديو متاح للتنزيل.", event.threadID);
      }
    } catch (error) {
      console.error('Error fetching or sending video:', error);
      api.sendMessage("⚠️ | حدث خطأ أثناء جلب أو إرسال الفيديو.", event.threadID);
    }
  }
};
