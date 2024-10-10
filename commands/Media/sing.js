import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اغنية",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقطع من YouTube",
  role: "member",
  aliases: ["أغنية","موسيقى","غني"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم الاغنية.", event.threadID);
    }

    data.shift();
    const songName = data.join(" ");

    try {
      const sentMessage = await api.sendMessage(`✔ | جاري البحث عن الأغنية المطلوبة "${songName}". المرجو الانتظار...`, event.threadID);

      const searchUrl = `https://smfahim.xyz/sing?name=${encodeURIComponent(songName)}`;
      const searchResponse = await axios.get(searchUrl);

      const songData = searchResponse.data?.data;
      if (!songData || !songData.audio) {
        api.unsendMessage(sentMessage.messageID);  // حذف رسالة الانتظار
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      const audioFileUrl = songData.audio;
      const fileName = `${event.senderID}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const audioStream = await axios({
        url: audioFileUrl,
        responseType: 'stream'
      });

      audioStream.data.pipe(writer);

      writer.on('finish', () => {
        api.unsendMessage(sentMessage.messageID);  // حذف رسالة الانتظار

        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
        }

        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        const message = {
          body: `✅ | تم تنزيل الأغنية:\n❀ العنوان: ${songData.title}`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });

    } catch (error) {
      api.unsendMessage(sentMessage.messageID);  // حذف رسالة الانتظار عند حدوث خطأ
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
