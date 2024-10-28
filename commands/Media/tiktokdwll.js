import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';

class VideoDownloader {
  name = 'تيكتوك';
  author = 'kaguya project';
  role = 'member';
  description = 'تنزيل فيديوهات من Facebook، YouTube، Instagram، Pinterest و TikTok باستخدام رابط URL.';

  async execute({ api, event }) {
    // التحقق من الرابط المُرسل
    const link = event.body.trim(); // استخدام الرابط المرسل مع إزالة المسافات
    if (!link || !/^(https?:\/\/)?(www\.tiktok\.com|vm\.tiktok\.com|youtube\.com|youtu\.be|facebook\.com|instagram\.com|pin\.it)\/.+$/.test(link)) {
      return api.sendMessage("⚠️ | يرجى إرسال رابط صالح يبدأ بـ https://.", event.threadID);
    }

    // إرسال رسالة الانتظار
    const downloadingMsg = await api.sendMessage("⏳ | جاري تنزيل الفيديو...", event.threadID);

    try {
      // تحديد رابط API الخاص بـ TikTok
      const url = 'https://ryuu-rest-apis.onrender.com/api/tiktok?url=';
      const response = await axios.get(`${url}${encodeURIComponent(link)}`);

      // التحقق مما إذا كان هناك فيديو متاح
      if (response.data.status && response.data.videoUrl) {
        const videoUrl = response.data.videoUrl;
        const videoTitle = `تيكتوك_${Date.now()}.mp4`; // تعيين اسم افتراضي للفيديو
        const videoPath = path.join(process.cwd(), 'cache', videoTitle);

        // التأكد من وجود مجلد cache
        fs.ensureDirSync(path.join(process.cwd(), 'cache'));

        // تحميل الفيديو كـ stream وحفظه في ملف
        const videoStream = await axios({
          method: 'GET',
          url: videoUrl,
          responseType: 'stream'
        });

        const fileWriteStream = fs.createWriteStream(videoPath);
        videoStream.data.pipe(fileWriteStream);

        // عند انتهاء تحميل الفيديو
        fileWriteStream.on('finish', async () => {
          await api.unsendMessage(downloadingMsg.messageID); // حذف رسالة الانتظار
          api.setMessageReaction("✅", event.messageID, (err) => {}, true); // إضافة رد فعل ✅

          // إرسال الفيديو
          await api.sendMessage({
            body: `✅ | تـم تـنـزيـل الــفـيـديـو بـنـجـاح`,
            attachment: fs.createReadStream(videoPath)
          }, event.threadID, () => {
            fs.unlinkSync(videoPath); // حذف الملف بعد الإرسال
          });
        });

        // معالجة أي أخطاء أثناء التحميل
        fileWriteStream.on('error', async (error) => {
          console.error('[ERROR] أثناء كتابة الملف:', error);
          await api.unsendMessage(downloadingMsg.messageID);
          api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", event.threadID);
        });
      } else {
        // في حال عدم وجود فيديو
        await api.unsendMessage(downloadingMsg.messageID);
        api.sendMessage("⚠️ | لا يوجد فيديو متاح للتنزيل.", event.threadID);
      }
    } catch (error) {
      // في حال حدوث أي خطأ أثناء التحميل أو الإرسال
      console.error('Error fetching or sending video:', error);
      await api.unsendMessage(downloadingMsg.messageID);
      api.sendMessage("⚠️ | حدث خطأ أثناء جلب أو إرسال الفيديو.", event.threadID);
    }
  }

  async events({ api, event }) {
    const { body } = event;

    if (body && /^(https?:\/\/)?(vm\.tiktok\.com|www\.tiktok\.com)\/.+$/.test(body)) {
      // إذا أرسل المستخدم رابط TikTok، يمكن تفعيل `execute` مباشرة من هنا
      this.execute({ api, event });
    }
  }
}

export default new VideoDownloader();
