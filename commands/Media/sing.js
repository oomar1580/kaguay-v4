import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اغنية",
  author: "حسين يعقوبي",
  role: "member",
  description: "تنزيل أغنية من Spotify باستخدام الاسم أو الرابط.",
  aliases: ["سبوتيفاي", "أغنية"],

  async execute({ api, args, event }) {
    try {
      if (args.length === 0) {
        return api.sendMessage("⚠️ | لم يتم توفير أي استعلام أو رابط. الاستخدام: /spotify <اسم الأغنية أو رابط>", event.threadID);
      }

      const queryOrUrl = args.join(' ');
      let songUrl;
      let songMetadata;
      let downloadLink;

      if (queryOrUrl.includes('open.spotify.com/track/')) {
        // إذا كان الإدخال رابطًا لمسار Spotify، استخدم API التنزيل مباشرة
        songUrl = queryOrUrl;
      } else {
        // إذا كان الإدخال اسم الأغنية، استخدم API البحث
        const searchResponse = await axios.get(`https://milanbhandari.onrender.com/spotisearch?query=${encodeURIComponent(queryOrUrl)}`);
        const searchResults = searchResponse.data;

        if (!searchResults.length) {
          return api.sendMessage("⚠️ | لم يتم العثور على أي أغاني لهذا الاستعلام.", event.threadID);
        }

        // استخدم النتيجة الأولى للبحث
        songUrl = searchResults[0].link;
      }

      // استخدم API التنزيل للحصول على رابط التنزيل والبيانات الوصفية
      const downloadResponse = await axios.get(`https://milanbhandari.onrender.com/spotify?url=${encodeURIComponent(songUrl)}`);
      const downloadData = downloadResponse.data;

      if (!downloadData.success) {
        return api.sendMessage("⚠️ | فشل في تنزيل الأغنية.", event.threadID);
      }

      downloadLink = downloadData.link;
      songMetadata = downloadData.metadata;

      const sentMessage = await api.sendMessage(`⏳ | جاري تنزيل ${songMetadata.title} بواسطة ${songMetadata.artists}...`, event.threadID);

      // إنشاء مسار ملف مؤقت
      const fileName = `${songMetadata.title.replace(/[^\w\s]/gi, '')}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);
      fs.ensureDirSync(path.join(process.cwd(), 'cache'));

      // تنزيل الملف الصوتي
      const response = await axios({
        method: 'GET',
        url: downloadLink,
        responseType: 'stream'
      });

      const fileWriteStream = fs.createWriteStream(filePath);
      response.data.pipe(fileWriteStream);

      fileWriteStream.on('finish', async () => {
        await api.unsendMessage(sentMessage.messageID);  // حذف رسالة الانتظار

        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

        if (fileSizeInBytes > 50 * 1024 * 1024) { // الحد الأقصى لحجم الملف هو 50 ميغابايت
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 50 ميغابايت.', event.threadID);
        }

        const message = `✅ | تم تنزيل الأغنية:\n❀ العنوان: ${songMetadata.title}\n❀ الفنان: ${songMetadata.artists}\n❀ الألبوم: ${songMetadata.album}\n❀ تاريخ الإصدار: ${songMetadata.releaseDate}\n❀ حجم الملف: ${fileSizeInMegabytes.toFixed(2)} MB`;

        await api.sendMessage({
          body: message,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        // حذف الملف بعد إرسال الرد
        fs.unlinkSync(filePath);
      });

      fileWriteStream.on('error', (error) => {
        console.error('[ERROR]', error);
        api.sendMessage('⚠️ | حدث خطأ أثناء كتابة الملف.', event.threadID);
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('⚠️ | حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
