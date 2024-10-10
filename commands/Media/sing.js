import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اغنية",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقطع من YouTube",
  role: "member",
  aliases: ["أغنية", "موسيقى"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم المقطع.", event.threadID);
    }

    data.shift();  // إزالة الكلمة الأولى
    const videoName = data.join(" ");

    try {
      const sentMessage = await api.sendMessage(`✔ | جاري البحث عن الأغنية المطلوبة "${videoName}". المرجو الانتظار...`, event.threadID);

      const searchUrl = `https://c-v1.onrender.com/yt/s?query=${encodeURIComponent(videoName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎵 | تم العثور على النتائج التالية:\n';
      const selectedResults = searchResults.slice(0, 4); // عرض أول 4 نتائج فقط
      const attachments = [];

      // تحميل الصور المصغرة وإضافتها للمرفقات
      for (let i = 0; i < selectedResults.length; i++) {
        const video = selectedResults[i];
        const videoIndex = i + 1;
        msg += `\n${videoIndex}. ❀ العنوان: ${video.title}`;
        
        const imagePath = path.join(process.cwd(), 'cache', `video_thumb_${videoIndex}.jpg`);
        const imageStream = await axios({
          url: video.thumbnail,
          responseType: 'stream',
        });

        const writer = fs.createWriteStream(imagePath);
        imageStream.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        attachments.push(fs.createReadStream(imagePath));
      }

      msg += '\n\n📥 | الرجاء الرد برقم من اجل تنزيل وسماع الأغنية.';

      api.unsendMessage(sentMessage.messageID);

      api.sendMessage({ body: msg, attachment: attachments }, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "اغنية",
          searchResults: selectedResults,
          unsend: true
        });

        // حذف الصور المؤقتة بعد إرسال الرسالة
        attachments.forEach((file) => fs.unlinkSync(file.path));
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { author, searchResults } = reply;

    if (event.senderID !== author) {
      return api.sendMessage("⚠️ | هذا ليس لك.", event.threadID);
    }

    const selectedIndex = parseInt(event.body, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= searchResults.length) {
      return api.sendMessage("❌ | الرجاء اختيار رقم صحيح من 1 إلى 4.", event.threadID);
    }

    const video = searchResults[selectedIndex];
    const videoUrl = video.videoUrl;

    if (!videoUrl) {
      return api.sendMessage("❌ | لم يتم العثور على رابط الفيديو.", event.threadID);
    }

    try {
      const downloadUrl = `https://joncll.serv00.net/yt.php?url=${encodeURIComponent(videoUrl)}`;
      const downloadResponse = await axios.get(downloadUrl);

      const audioFileUrl = downloadResponse.data.data.downloadLink.url;

      if (!audioFileUrl) {
        return api.sendMessage("⚠️ | لم يتم العثور على رابط تحميل الأغنية.", event.threadID);
      }

      api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

      const fileName = `${Date.now()}_${event.senderID}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const audioStream = await axios({
        url: audioFileUrl,
        responseType: 'stream'
      });

      audioStream.data.pipe(writer);

      writer.on('finish', () => {
        if (fs.statSync(filePath).size > 26214400) { // Check if file exceeds 25MB
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
        }

        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        const message = {
          body: `✅ | تم تنزيل الأغنية:\n❀ العنوان: ${video.title}`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });

      writer.on('error', (err) => {
        console.error('[ERROR] Download Error:', err);
        api.sendMessage('❌ | حدث خطأ أثناء تنزيل الملف. حاول مجددًا لاحقًا.', event.threadID);
        fs.unlinkSync(filePath); // Ensure file is deleted on error
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
