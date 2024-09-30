import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اغنية",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقطع من Spotify",
  role: "member",
  aliases: ["أغنية","موسيقى","غني","سبوتيفاي"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم المقطع.", event.threadID);
    }

    data.shift();
    const videoName = data.join(" ");

    try {
      const sentMessage = await api.sendMessage(`✔ | جاري البحث عن الأغنية المطلوبة "${videoName}". المرجو الانتظار...`, event.threadID);

      const searchUrl = `https://c-v1.onrender.com/api/spotify/v1?query=${encodeURIComponent(videoName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎵 | تم العثور على النتائج التالية:\n';
      const selectedResults = searchResults.slice(0, 4); // Get only the first 4 results
      const attachments = [];

      for (let i = 0; i < selectedResults.length; i++) {
        const song = selectedResults[i];
        const songIndex = i + 1;
        msg += `\n${songIndex}. ❀ العنوان: ${song.name} - الفنان: ${song.artists.join(", ")}`;

        // تنزيل المعاينة وإضافتها إلى المرفقات
        const audioPath = path.join(process.cwd(), 'cache', `song_preview_${songIndex}.mp3`);
        const audioStream = await axios({
          url: song.preview_url,
          responseType: 'stream',
        });

        const writer = fs.createWriteStream(audioPath);
        audioStream.data.pipe(writer);

        await new Promise((resolve) => {
          writer.on('finish', resolve);
        });

        attachments.push(fs.createReadStream(audioPath));
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

        // حذف الملفات المؤقتة بعد إرسال الرسالة
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
      return api.sendMessage("❌ | الرد غير صالح. يرجى الرد برقم صحيح.", event.threadID);
    }

    const song = searchResults[selectedIndex];

    try {
      api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

      const message = {
        body: `✅ | تم تنزيل الأغنية:\n❀ العنوان: ${song.name} - الفنان: ${song.artists.join(", ")}`,
        attachment: fs.createReadStream(path.join(process.cwd(), 'cache', `song_preview_${selectedIndex + 1}.mp3`))
      };

      api.sendMessage(message, event.threadID, () => {
        // حذف الملف المؤقت بعد إرسال الرسالة
        fs.unlinkSync(path.join(process.cwd(), 'cache', `song_preview_${selectedIndex + 1}.mp3`));
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
