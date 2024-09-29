import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

export default {
  name: "تخيلي",
  author: "kaguya project",
  cooldowns: 50,
  description: "فم بتوليد ثور بإستخدام الذكاء الإصطناعي dalle",
  role: "member",
  aliases: ["dalle", "تخيل"],
  execute: async ({ api, event, args, Economy }) => {

    const senderID = event.senderID;
    let prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;

    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    try {
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

      // تغيير الرابط حسب الطلب
      const res = await axios.get(`https://c-v3.onrender.com/v1/gen?prompt=${encodeURIComponent(translatedText)}`);
      const imageUrl = res.data.image_url; // تأكد من الحصول على الصورة من الاستجابة

      console.log('Image URL:', imageUrl); // تسجيل عنوان URL للصورة في وحدة التحكم

      if (!imageUrl) {
        api.sendMessage("⚠️ | حدث خطأ أثناء عملية توليد الصورة ", event.threadID, event.messageID);
        return;
      }

      // تحميل الصورة باستخدام الرابط المباشر
      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imgPath = path.join(process.cwd(), 'cache', 'image.jpg');
      await fs.outputFile(imgPath, imgResponse.data);
      const imgData = fs.createReadStream(imgPath);

      // استخدام moment-timezone لجلب الوقت والتاريخ
      const now = moment().tz("Africa/Casablanca");
      const timeString = now.format("HH:mm:ss");
      const dateString = now.format("YYYY-MM-DD");
      const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      api.getUserInfo(senderID, async (err, userInfo) => {
        if (err) {
          console.log(err);
          return;
        }
        const userName = userInfo[senderID].name;

        await api.sendMessage({
          attachment: imgData,
          body: `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n📝 | ❏الـبـرومـبـت : ${prompt}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`
        }, event.threadID, event.messageID);
      });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      api.sendMessage("⚠️ | حدث خطأ", event.threadID, event.messageID);
    }
  }
};
