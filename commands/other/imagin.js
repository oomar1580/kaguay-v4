import axios from "axios";
import path from "path";
import fs from "fs-extra";
import moment from "moment-timezone";

export default {
  name: "تخيلي",
  author: "HUSSEIN YACOUBI",
  role: "member",
  description: "توليد الصور باستخدام dalle-E",
  aliases: ["تخيل", "dalle"],
  cooldown: 50,

  execute: async ({ api, event, args, Economy }) => {
    const senderID = event.senderID;
    let prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;

    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);

    if (!prompt) {
      return api.sendMessage("❌|  صيغة خاطئة. ✅ | إستخدم الامر هكذا : 17/18 years old boy/girl watching football match on TV with 'Dipto' and '69' written on the back of their dress, 4", event.threadID, event.messageID);
    }

    try {
      // Translate prompt to English
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      prompt = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

      // Random cookie for request
      const cookies = ["197sgGZc_TvR2nOGkwbB1zhdP0wy5AMiTqTTfGNMDPs6Os_FCXhfTllfxDFXv9GGLFNEJAk3RmvVZfMyG4qMzsfFiaFbLUJLjPlDMscmQNMwqwC3pZlMJ1M2dhjaLUvEPx_6fidpcNkP3CldXIbtkSQQIVicU2QHqrY_AszyefMpxAxWsfkqYZhPi-5eq8dHuYb_Xe4zQxsJogniVIwgLUnsiB4x_puBO3gafmYXcko8"];
      const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];

      // Notify user that the image is being processed
      const wait = api.sendMessage("⏱️ | جاري معالجة طلبك يرجى الانتظار...", event.threadID);

      // Request to generate the image
      const response = await axios.get(`https://www.noobs-api.000.pe/dipto/dalle?prompt=${prompt}&key=dipto008&cookies=${randomCookie}`);
      const imageUrls = response.data.imgUrls || [];

      if (!imageUrls.length) {
        return api.sendMessage("❌ | لم يتم توليد أي صور.", event.threadID, event.messageID);
      }

      // Download the first image
      const downloadDirectory = process.cwd();
      const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.jpg`);
      const imageResponse = await axios.get(imageUrls[0], { responseType: 'stream' });

      const fileStream = fs.createWriteStream(filePath);
      imageResponse.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        // Get current time, date, and execution duration
        const now = moment().tz("Africa/Casablanca");
        const timeString = now.format("HH:mm:ss");
        const dateString = now.format("YYYY-MM-DD");
        const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

        // Get user info
        api.getUserInfo(senderID, async (err, userInfo) => {
          if (err) {
            console.error(err);
            return;
          }

          const userName = userInfo[senderID]?.name || "Unknown";

          // Send the image and details
          const messageBody = `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n📝 | ❏الـبـرومـبـت : ${prompt}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`;

          await api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        // Remove the waiting message
        api.unsendMessage(wait.messageID);

        // React with success
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      });

      fileStream.on('error', (error) => {
        api.sendMessage("⚠️ | حدث خطأ أثناء تنزيل الصورة. يرجى المحاولة لاحقًا.", event.threadID);
        console.error("Error downloading the image:", error);
      });
    } catch (error) {
      console.error("Error processing the request:", error);
      api.sendMessage("⚠️ | حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقًا.", event.threadID, event.messageID);
    }
  }
};