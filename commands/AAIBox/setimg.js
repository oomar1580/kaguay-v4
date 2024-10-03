import axios from "axios";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

class WaifuAPICommand {
  constructor() {
    this.name = "زوجة";
    this.author = "YourName";
    this.cooldowns = 10;
    this.description = "مجموعة من صوى فتيات انمي";
    this.role = "member";
    this.aliases = ["waifu"];
  }

  async execute({ api, event }) {
    try {
      // طلب الصورة من الرابط
      const { data } = await axios.get(`https://smfahim.xyz/waifu`);

      // تحقق من وجود الرابط في النتيجة
      if (!data || !data.url) {
        return api.sendMessage('❌ | لم يتم العثور على أي صورة.', event.threadID, event.messageID);
      }

      // معلومات الصورة والمصمم
      const imageUrl = data.url;
      const authorName = data.author.name;
      const authorContact = data.author.contact;

      const cacheDir = path.join(__dirname, 'cache', 'Waifu');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const imagePath = path.join(cacheDir, `${Date.now()}.jpg`);

      // تنزيل الصورة وحفظها في مجلد مؤقت
      const imageBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(imagePath, Buffer.from(imageBuffer, "binary"));
api.setMessageReaction("😘", event.messageID, (err) => {}, true);
      // إرسال الصورة مع معلومات المؤلف
      await api.sendMessage(
        {
          attachment: fs.createReadStream(imagePath),
          body: `࿇ ══━━━✥◈✥━━━══ ࿇\n\t\t\t\t💜☟  ω𝒶ⓘфυ  ☟💜\n࿇ ══━━━✥◈✥━━━══ ࿇`,        },
        event.threadID,
        event.messageID
      );

      // حذف الصورة من المجلد المؤقت بعد إرسالها
      fs.unlinkSync(imagePath);
    } catch (error) {
      return api.sendMessage(
        `❌ | حدث خطأ أثناء جلب الصورة: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
}

export default new WaifuAPICommand();
