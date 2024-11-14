import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقطع من YouTube",
  role: "عضو",
  aliases: ["يوتيب", "فيديو", "مقطع"],

  async execute({ api, event }) {
    const msg = `●═══════❍═══════●\n\t\t\t\t〖ⓎⓄⓊⓉⓊⒷⒺ〗\n📝 | رد عـلـى الـرسـالـة و أدخـل إسـم الـمـقـطـع الـمـراد الـبـحـث عـنـه\n●═══════❍═══════●`;
    
    api.sendMessage(msg, event.threadID, (error, message) => {
      if (error) {
        console.error('[ERROR]', error);
        return;
      }

      global.client.handler.reply.set(message.messageID, {
        author: event.senderID,
        type: "inputVideo",
        name: "يوتيوب",
        unsend: true,
      });
    });
  },

  async onReply({ api, event, reply }) {
    if (reply.type === 'inputVideo') {
      const videoName = event.body.trim();

      if (!videoName) {
        return api.sendMessage("●═══════❍═══════●\n\t\t\t\t〖ⓎⓄⓊⓉⓊⒷⒺ〗\n📝 | رد عـلـى الـرسـالـة و أدخـل إسـم الـمـقـطـع الـمـراد الـبـحـث عـنـه\n●═══════❍═══════●", event.threadID);
      }

      try {
        const sentMessage = await api.sendMessage(`✔ | جاري البحث عن المقطع المطلوب "${videoName}". المرجو الانتظار...`, event.threadID);

        const searchUrl = `https://c-v1.onrender.com/yt/s?query=${encodeURIComponent(videoName)}`;
        const searchResponse = await axios.get(searchUrl);

        const searchResults = searchResponse.data;
        if (!searchResults || searchResults.length === 0) {
          return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
        }

        let msg = '🎥 | تم العثور على المقاطع الأربعة التالية :\n';
        const selectedResults = searchResults.slice(0, 4);
        const attachments = [];

        const numberSymbols = ['⓵', '⓶', '⓷', '⓸'];

        for (let i = 0; i < selectedResults.length; i++) {
          const video = selectedResults[i];
          const videoIndex = numberSymbols[i];

          msg += `\n${videoIndex}. ❀ العنوان: ${video.title}`;

          const imagePath = path.join(process.cwd(), 'cache', `video_thumb_${i + 1}.jpg`);
          const imageStream = await axios({
            url: video.thumbnail,
            responseType: 'stream',
          });

          const writer = fs.createWriteStream(imagePath);
          imageStream.data.pipe(writer);

          await new Promise((resolve) => {
            writer.on('finish', resolve);
          });

          attachments.push(fs.createReadStream(imagePath));
        }

        msg += '\n\n📥 | الرجاء الرد برقم المقطع الذي تود تنزيله.';

        api.unsendMessage(sentMessage.messageID);

        api.sendMessage({ body: msg, attachment: attachments }, event.threadID, (error, info) => {
          if (error) return console.error(error);

          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "يوتيوب",
            searchResults: selectedResults,
            unsend: true
          });

          attachments.forEach((file) => fs.unlinkSync(file.path));
        });

      } catch (error) {
        console.error('[ERROR]', error);
        api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
      }
    } else if (reply.type === 'pick') {
      const { author, searchResults } = reply;

      if (event.senderID !== author) {
        return api.sendMessage("⚠️ | هذا ليس لك.", event.threadID);
      }

      const selectedIndex = parseInt(event.body, 10) - 1;

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= searchResults.length) {
        return api.sendMessage("❌ | الرد غير صالح. يرجى الرد برقم صحيح.", event.threadID);
      }

      const video = searchResults[selectedIndex];
      const videoUrl = video.videoUrl;

      try {
        const downloadUrl = `https://api.nexoracle.com/downloader/yt-video?apikey=932950ea576a2a2c12&url=${encodeURIComponent(videoUrl)}`;
        const downloadResponse = await axios.get(downloadUrl);

        const { result } = downloadResponse.data;
        const videoFileUrl = result.video;
        if (!videoFileUrl) {
          return api.sendMessage("⚠️ | لم يتم العثور على رابط تحميل المقطع.", event.threadID);
        }

        api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

        const fileName = `${event.senderID}.mp4`;
        const filePath = path.join(process.cwd(), 'cache', fileName);

        const writer = fs.createWriteStream(filePath);
        const videoStream = axios.get(videoFileUrl, { responseType: 'stream' }).then(response => {
          response.data.pipe(writer);
          writer.on('finish', () => {
            if (fs.statSync(filePath).size > 26214400) {
              fs.unlinkSync(filePath);
              return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
            }

            api.setMessageReaction("✅", event.messageID, (err) => {}, true);

            const message = {
              body: `━━━━━━━◈✿◈━━━━━━━\n✅ | تـم تـحـمـيـل الـفـيـديو:\n❀ الـعـنـوان : ${result.title}\n📅 | تـاريـخ الـرفـع : ${result.publish_at}\n👍 | عـدد الـايـكـات : ${result.desc}\n👁️ | عـدد الـمـشـاهـدات : ${result.views}\n━━━━━━━◈✿◈━━━━━━━`,
              attachment: fs.createReadStream(filePath)
            };

            api.sendMessage(message, event.threadID, () => {
              fs.unlinkSync(filePath);
            });
          });
        });

      } catch (error) {
        console.error('[ERROR]', error);
        api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
      }
    }
  }
};
