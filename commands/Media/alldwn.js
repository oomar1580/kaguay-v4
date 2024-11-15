import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';

class VideoDownloader {
  name = 'اوتو';
  author = 'kaguya project';
  role = 'member';
  description = 'تنزيل مقاطع الفيديو من Facebook، YouTube، Instagram، وPinterest باستخدام رابط URL.';

  async execute({ api, event }) {
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

    const link = event.body; // استخدام الرابط المرسل
    const downloadingMsg = await api.sendMessage("⏳ | جـارٍ تـنـزيـل الـمـقـطـع...", event.threadID);

    try {
      // استخدام رابط API الجديد
      const apiUrl = `https://api.nexoracle.com/downloader/aio2?apikey=932950ea576a2a2c12&url=${encodeURIComponent(link)}`;

      // طلب البيانات من API
      const response = await axios.get(apiUrl);
      const mediaData = response.data;

      // تحقق من توفر الفيديو
      if (mediaData.status === 200 && mediaData.result && mediaData.result.medias) {
        const videoMedia = mediaData.result.medias.find(media => media.videoAvailable);
        
        if (!videoMedia) {
          throw new Error("لا يوجد فيديو متاح للتنزيل.");
        }

        const videoUrl = videoMedia.url;
        const videoTitle = mediaData.result.title || 'محتوى غير متوفر';
        const videoDuration = mediaData.result.duration || 'غير متوفر';
        const videoPath = path.join(process.cwd(), 'cache', `${videoTitle}.mp4`);
        fs.ensureDirSync(path.join(process.cwd(), 'cache'));

        // تحميل الفيديو
        const videoStream = await axios({
          method: 'GET',
          url: videoUrl,
          responseType: 'stream'
        });

        const fileWriteStream = fs.createWriteStream(videoPath);
        videoStream.data.pipe(fileWriteStream);

        fileWriteStream.on('finish', async () => {
          await api.unsendMessage(downloadingMsg.messageID);
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          await api.sendMessage({
            body: `✅ | تـم تـنـزيـل الـفـيـديـو بـنـجـاح \n📝 | الـعـنـوان : ${videoTitle}\n⏳ | الـمـدة: ${videoDuration}`,
            attachment: fs.createReadStream(videoPath)
          }, event.threadID);
          fs.unlinkSync(videoPath); // حذف الملف بعد الإرسال
        });

        fileWriteStream.on('error', async (error) => {
          console.error('[ERROR] أثناء كتابة الملف:', error);
          await api.unsendMessage(downloadingMsg.messageID);
          api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", event.threadID);
        });
      } else {
        await api.unsendMessage(downloadingMsg.messageID);
        api.sendMessage("⚠️ | لا يوجد فيديو متاح للتنزيل.", event.threadID);
      }
    } catch (error) {
      console.error('Error fetching or sending video:', error);
      await api.unsendMessage(downloadingMsg.messageID);
      api.sendMessage("⚠️ | حدث خطأ أثناء جلب أو إرسال الفيديو.", event.threadID);
    }
  }

  async events({ api, event }) {
    const { body, threadID, senderID } = event;

    if (body && /^(https?:\/\/)?(www\.)?(facebook\.com|instagram\.com|pin\.it|youtube\.com|youtu\.be)\/.+$/.test(body)) {
      // إذا أرسل المستخدم رابط صالح، يمكن تفعيل `execute` مباشرة من هنا
      this.execute({ api, event });
    }
  }
}

export default new VideoDownloader();
