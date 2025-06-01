import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تحميل فيديو أو صوت من YouTube",
  role: "member",
  aliases: ["youtube", "يوتوب"],

  async execute({ api, event }) {
    const input = event.body.trim().split(" ");
    const type = input[1]; // صوت أو فيديو

    if (input.length < 3 || (type !== "فيديو" && type !== "صوت")) {
      return api.sendMessage("⚠️ | اكتب: يوتيوب فيديو <اسم المقطع> أو يوتيوب صوت <اسم المقطع>", event.threadID);
    }

    const videoName = input.slice(2).join(" ");
    const searchUrl = `https://rapido.zetsu.xyz/api/ytsearch?query=${encodeURIComponent(videoName)}`;

    try {
      const sentMessage = await api.sendMessage(`🔎 | جاري البحث عن "${videoName}"...`, event.threadID);

      const searchRes = await axios.get(searchUrl);
      const results = searchRes.data.data;

      if (!results || results.length === 0) {
        return api.sendMessage("❌ | لم يتم العثور على نتائج.", event.threadID);
      }

      const video = results[0]; // نتيجة واحدة فقط
      const videoUrl = video.url;

      const apiUrl = `https://hazeyyyy-rest-apis.onrender.com/api/youtubedl3?url=${encodeURIComponent(videoUrl)}`;
      const downloadRes = await axios.get(apiUrl);

      const links = downloadRes.data.youtube?.data?.[0]?.links;

      if (!links) return api.sendMessage("❌ | فشل في استخراج روابط التحميل.", event.threadID);

      let downloadLink;
      if (type === "فيديو") {
        downloadLink = links.find(link => link[0] === "mp4");
      } else {
        downloadLink = links.find(link => link[0] === "m4a");
      }

      if (!downloadLink || !downloadLink[3]) {
        return api.sendMessage(`❌ | لم يتم العثور على رابط ${type}.`, event.threadID);
      }

      const urlToDownload = downloadLink[3];
      const ext = type === "فيديو" ? "mp4" : "m4a";
      const fileName = `${event.senderID}.${ext}`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      api.setMessageReaction("⬇️", event.messageID, () => {}, true);

      const writer = fs.createWriteStream(filePath);
      const stream = await axios({ url: urlToDownload, responseType: 'stream' });
      stream.data.pipe(writer);

      writer.on('finish', () => {
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ | الملف أكبر من 25MB ولا يمكن إرساله.', event.threadID);
        }

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage({
          body: `✅ | تم التحميل:\nالعنوان: ${video.title}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });

    } catch (err) {
      console.error("[ERROR]", err);
      api.sendMessage("❌ | حدث خطأ أثناء تنفيذ الأمر.", event.threadID);
    }
  }
};
