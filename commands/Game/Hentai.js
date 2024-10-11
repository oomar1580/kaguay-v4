import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "هينتاي",
  author: "ChatGPT",
  role: "member",
  aliases:["hentai"],
  description: "صور مثيرة للفتيات في الأنمي.",
  async execute({ api, event, Economy }) {
    try {
      const response = await axios.get('https://smfahim.xyz/anime/v2/waifu');
      const imageUrl = response.data.url;
      const ext = imageUrl.split('.').pop();

      // استخدام process.cwd() بدلاً من __dirname
      const tempFilePath = path.join(process.cwd(), 'cache', `waifu.${ext}`);

      const writer = fs.createWriteStream(tempFilePath);
      axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
      }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {

          // إصلاح استدعاء api.setMessageReaction
          api.setMessageReaction("🥵", event.messageID, (err) => {}, true);
          
          // إرسال الصورة
          api.sendMessage(
            {
              attachment: fs.createReadStream(tempFilePath)
            },
            event.threadID,
            () => fs.unlinkSync(tempFilePath),
            event.messageID
          );
        });
      });
    } catch (error) {
      console.error("Error fetching Waifu image:", error.message);
      api.sendMessage("🚧 | حدث خطأ أثناء جلب الصورة. يرجى المحاولة مرة أخرى.", event.threadID, event.messageID);
    }
  }
};
