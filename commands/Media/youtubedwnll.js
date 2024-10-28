import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';

class YouTubeDownloader {
  name = 'يوتيوب';
  author = 'kaguya project';
  role = 'member';
  description = 'تنزيل فيديو من YouTube باستخدام رابط URL.';

  async execute({ api, event }) {
    const link = event.body.trim();
    if (!link || !/^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/.test(link)) {
      return api.sendMessage("⚠️ | يرجى إرسال رابط YouTube صالح يبدأ بـ https://.", event.threadID);
    }

    const downloadingMsg = await api.sendMessage("⏳ | جاري تنزيل الفيديو...", event.threadID);

    try {
      const url = 'https://c-v5.onrender.com/downloader?url=';
      const response = await axios.get(`${url}${encodeURIComponent(link)}`);

      if (response.data.media && response.data.media.url) {
        const videoUrl = response.data.media.url;
        const videoTitle = `يوتيوب_${Date.now()}.mp4`;
        const videoPath = path.join(process.cwd(), 'cache', videoTitle);

        fs.ensureDirSync(path.join(process.cwd(), 'cache'));

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
            body: `✅ | تـم تـنـزيـل الــفـيـديـو بـنـجـاح`,
            attachment: fs.createReadStream(videoPath)
          }, event.threadID, () => {
            fs.unlinkSync(videoPath);
          });
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
    const { body } = event;
    if (body && /^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/.test(body)) {
      this.execute({ api, event });
    }
  }
}

export default new YouTubeDownloader();
