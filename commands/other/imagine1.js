import axios from "axios";
import path from "path";
import fs from "fs-extra";
import moment from "moment-timezone";

export default {
  name: "تخيلي",
  author: "مشروع كاغويا",
  role: "member",
  aliases: ["dalle", "تخيل"],
  description: "توليد صورة بناءً على النص المدخل.",

  execute: async function ({ api, event }) {
    const senderID = event.senderID;

    // طلب من المستخدم إدخال البرومبت أولاً
    api.sendMessage("👥 | من فضلك أدخل النص (البرومبت) الذي تريد تحويله إلى صورة:", event.threadID, (err, message) => {
      global.client.handler.reply.set(message.messageID, {
        author: senderID,
        type: "textPrompt",
        name: "تخيلي",
        collectedData: {},
        unsend: true
      });
    });
  },

  onReply: async ({ api, event, reply }) => {
    const messageBody = event.body.trim();
    if (reply.author !== event.senderID) return; // التحقق من أن المستخدم هو نفسه
    let collectedData = reply.collectedData || {};

    switch (reply.type) {
      case "textPrompt": // الحالة الأولى: المستخدم أدخل البرومبت
        collectedData.prompt = messageBody;
        api.sendMessage("⚙️ | أدخل رقم الموديل بين 1 و 55:", event.threadID, (err, message) => {
          global.client.handler.reply.set(message.messageID, {
            author: event.senderID,
            type: "modelSelection",
            name: "تخيلي",
            collectedData: collectedData,
            unsend: true
          });
        });
        break;

      case "modelSelection": // الحالة الثانية: المستخدم أدخل رقم الموديل
        const modelNumber = parseInt(messageBody);
        if (isNaN(modelNumber) || modelNumber < 1 || modelNumber > 55) {
          api.sendMessage("⚠️ | رقم الموديل غير صحيح. يرجى إدخال رقم بين 1 و 55.", event.threadID, event.messageID);
          return;
        }
        collectedData.model = modelNumber;

        // إرسال رسالة الانتظار
        api.sendMessage("⏳ | جاري معالجة الطلب، يرجى الانتظار...", event.threadID, async (err, waitMessage) => {
          global.client.handler.reply.delete(event.messageID); // حذف رسالة الرد بعد الحصول على الموديل

          try {
            // ترجمة النص إلى الإنجليزية (إذا لزم الأمر)
            const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(collectedData.prompt)}`);
            if (!translationResponse || !translationResponse.data || !translationResponse.data[0] || !translationResponse.data[0][0]) {
              api.sendMessage("⚠️ | فشل في ترجمة النص.", event.threadID, event.messageID);
              return;
            }
            const translatedPrompt = translationResponse.data[0][0][0];

            // رابط الـ API الجديد مع البرومبت والموديل
            const apiUrl = `https://smfahim.xyz/prodia?prompt=${encodeURIComponent(translatedPrompt)}&model=${collectedData.model}`;
            const response = await axios.get(apiUrl, { responseType: 'stream' });

            if (!response.data) {
              api.sendMessage("فشل في استرجاع الصورة.", event.threadID, event.messageID);
              return;
            }

            // حفظ الصورة في مجلد cache
            const downloadDirectory = path.join(process.cwd(), 'cache');
            fs.ensureDirSync(downloadDirectory);
            const filePath = path.join(downloadDirectory, `${Date.now()}.jpg`);

            const fileStream = fs.createWriteStream(filePath);
            response.data.pipe(fileStream);

            fileStream.on('finish', async () => {
              fileStream.close();  // إغلاق التدفق
              const now = moment().tz("Africa/Casablanca");
              const timeString = now.format("HH:mm:ss");
              const dateString = now.format("YYYY-MM-DD");
              const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

              api.getUserInfo(event.senderID, async (err, userInfo) => {
                if (err) {
                  console.log(err);
                  api.sendMessage("⚠️ | حدث خطأ أثناء جلب معلومات المستخدم.", event.threadID, event.messageID);
                  return;
                }
                const userName = userInfo[event.senderID].name;
                const messageBody = `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n\t\t࿇ ══━━✥◈✥━━══ ࿇`;

                // تفاعل مع الرسالة وأرسل الصورة
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                api.sendMessage({
                  body: messageBody,
                  attachment: fs.createReadStream(filePath)
                }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
              });
            });

            fileStream.on('error', (error) => {
              api.sendMessage("❌ | حدث خطأ أثناء تنزيل الصورة. يرجى المحاولة لاحقًا.", event.threadID, event.messageID);
              api.unsendMessage(waitMessage.messageID); // حذف رسالة الانتظار
              console.error("خطأ في تنزيل الصورة:", error);
            });
          } catch (error) {
            api.sendMessage("❌ | حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
            console.error("خطأ أثناء معالجة الطلب:", error);
          }
        });
        break;

      default:
        api.sendMessage("⚠️ | حدث خطأ غير متوقع.", event.threadID, event.messageID);
    }
  }
};
