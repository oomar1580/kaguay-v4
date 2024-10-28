import axios from "axios";
import fs from "fs-extra";
import path from "path";

async function avatarAlert({ api, event, args }) {
  try {
    const { threadID, messageID } = event;

    // التحقق من أن المستخدم أدخل 5 قيم فقط (name, subname, id, colorname, colorsub)
    if (args.length !== 5) {
      return api.sendMessage("⚠️ | يرجى إدخال 5 معلومات بالترتيب: name, subname, id, colorname, colorsub.\nمثال: John Doe 123 blue red", threadID, messageID);
    }

    // استخلاص القيم من المدخلات
    const [name, subname, id, colorname, colorsub] = args;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = path.join(process.cwd(), 'cache', `${timestamp}_fbcover.png`);

    // إضافة رد فعل لإعلام المستخدم بأن العملية قيد التقدم
    api.setMessageReaction("📱", event.messageID, () => {}, true);

    // جلب الصورة باستخدام القيم المدخلة
    const response = await axios.get(`https://joshweb.click/canvas/fbcoverv4?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&id=${encodeURIComponent(id)}&colorname=${encodeURIComponent(colorname)}&colorsub=${encodeURIComponent(colorsub)}`, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

    // تغيير رد الفعل لإعلام المستخدم بنجاح العملية
    api.setMessageReaction("👌", event.messageID, () => {}, true);

    // إرسال الصورة بعد 5 ثواني وحذفها بعد إرسالها
    setTimeout(function () {
      api.sendMessage({
        body: "FB COVER IMAGE",
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        setTimeout(() => {
          fs.unlinkSync(imagePath);
        }, 5 * 1000);
      }, messageID);
    }, 5 * 1000);
  } catch (error) {
    console.error(error);
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
}

export default {
  name: "اڤتار",
  author: "kaguya project",
  description: "يرسل صورة غلاف بناءً على name, subname, id, colorname, colorsub.\nمثال: John Doe 123 blue red",
  aliases: ["avatar"],
  execute: avatarAlert
};
