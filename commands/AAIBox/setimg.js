import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "زوجة",
  author: "YourName",
  role: "member",
  aliases:["waifu"],
  description: "أحضر صورة أنمي عشوائية.",

  async execute({ api, event }) {
    try {
      // استخدم الرابط الجديد للحصول على الصورة
      const res = await axios.get(`https://c-v1.onrender.com/api/waifu`);
      const imgUrl = res.data.url; // الرابط الجديد للصورة

      if (imgUrl) {
        const imagePath = path.join(process.cwd(), 'cache', `${Date.now()}.png`);
        const writer = fs.createWriteStream(imagePath);
        const response = await axios({
          url: imgUrl,
          method: 'GET',
          responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
          api.setMessageReaction("😘", event.messageID, (err) => {}, true);
  
          api.sendMessage({
            body: `࿇ ══━━━✥◈✥━━━══ ࿇\n\t\t\t\t💜☟  ω𝒶ⓘфυ  ☟💜\n࿇ ══━━━✥◈✥━━━══ ࿇`,
            attachment: fs.createReadStream(imagePath)
          }, event.threadID, () => fs.unlinkSync(imagePath));
        });

        writer.on('error', (err) => {
          console.error('Error writing file:', err);
          api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
        });
      } else {
        api.sendMessage('❓ | لم يتم العثور على صورة.', event.threadID, event.messageID);
      }
    } catch (e) {
      console.error('Error fetching image:', e);
      api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
    }
  }
};
