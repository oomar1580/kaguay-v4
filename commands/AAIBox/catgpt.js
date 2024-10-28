import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "جودة",
  author: "HUSSEIN YACOUBI",
  role: "member",
  aliases: ["تحسين", "رفع", "4k"],
  description: "رفع جودة الصور",

  async execute({ api, event, args }) {
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

    function isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    }

    let imageUrl;

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const replyAttachment = event.messageReply.attachments[0];
      if (["photo", "sticker"].includes(replyAttachment.type)) {
        imageUrl = replyAttachment.url;
      } else {
        return api.sendMessage({ body: `⚠️ | يرجى الرد على صورة صحيحة.` }, event.threadID, event.messageID);
      }
    } else if (args[0] && isValidUrl(args[0]) && args[0].match(/\.(png|jpg|jpeg)$/)) {
      imageUrl = args[0];
    } else {
      return api.sendMessage({ body: `⚠️ | رد على صورة` }, event.threadID, event.messageID);
    }

    try {
      const apiUrl = `https://smfahim.xyz/4k?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      if (response && response.data && response.data.status && response.data.image) {
        const enhancedImageUrl = response.data.image;
        const imageStream = await axios({
          url: enhancedImageUrl,
          responseType: 'stream'
        });

        const filePath = path.join(process.cwd(), 'cache', `${Date.now()}_enhanced.png`);
        const writer = fs.createWriteStream(filePath);
        imageStream.data.pipe(writer);

        writer.on('finish', () => {
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          api.sendMessage({
            body: `━━━━━━━◈✿◈━━━━━━━\n✅ | تمـٰ ࢪفــ͡ـعـ๋͜‏ـۂ اݪجـوُدِة بـنجـاح\n━━━━━━━◈✿◈━━━━━━━`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));
        });

        writer.on('error', (err) => {
          console.error('Error writing file:', err);
          api.sendMessage({ body: `🚧 | حدث خطأ أثناء معالجة الصورة.` }, event.threadID, event.messageID);
        });
      } else {
        throw new Error(`فشل في جلب الصورة أو استجابة فارغة.`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      api.sendMessage({ body: `🚧 | حدث خطأ أثناء معالجة الصورة: ${error.message}` }, event.threadID, event.messageID);
    }
  }
};
