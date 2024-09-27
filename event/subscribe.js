import { log } from "../logger/index.js";
import fs, { existsSync, mkdirSync } from "fs";
import axios from "axios";
import path from "path";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    // جلب بيانات المجموعة
    var threads = (await Threads.find(event.threadID))?.data?.data;

    // التحقق من وجود بيانات المجموعة
    if (!threads) {
      await Threads.create(event.threadID);
    }

    switch (event.logMessageType) {
      case "log:unsubscribe": {
        // إذا تم طرد البوت من المجموعة
        if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
          await Threads.remove(event.threadID);
          return log([
            {
              message: "[ THREADS ]: ",
              color: "yellow",
            },
            {
              message: `تم حذف بيانات المجموعة مع المعرف: ${event.threadID} لأن البوت تم طرده.`,
              color: "green",
            },
          ]);
        }
        // تحديث عدد الأعضاء بعد خروج شخص
        await Threads.update(event.threadID, {
          members: +threads.members - 1,
        });
        // إرسال رسالة إشعار بخروج شخص
        api.sendMessage(event.logMessageBody, event.threadID);
        break;
      }

      case "log:subscribe": {
        // إذا تمت إضافة البوت إلى المجموعة
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة التوصيل
          api.unsendMessage(event.messageID);

          // تغيير اسم البوت عند إضافته إلى المجموعة
          const botName = "كاغويا"; // اسم البوت
          api.changeNickname(
            `》 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // رسالة الترحيب
          const welcomeMessage = `┌───── ～✿～ ─────┐\n✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n❏ رابـط الـمـطـور : https://www.facebook.com/profile.php?id=100076269693499 \n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  | اكتب قائمة او اوامر \n╼╾─────⊹⊱⊰⊹─────╼╾\n🔖 | اكتب ضيفيني من اجل ان تدخل مجموعة البوت او تقرير \n╼╾─────⊹⊱⊰⊹─────╼╾\n〘🎀 KᗩGᑌYᗩ ᗷOT 🎀〙\n└───── ～✿～ ─────┘`;

          // الرابط الخاص بالفيديو الترحيبي
          const videoLink = 'https://i.imgur.com/6LeT4Xa.mp4'; // ضع الرابط الصحيح للفيديو هنا

          // مسار مجلد مؤقت لتخزين الفيديو باستخدام process.cwd()
          const tmpFolderPath = path.join(process.cwd(), 'tmp');

          // إنشاء المجلد إذا لم يكن موجودًا
          if (!existsSync(tmpFolderPath)) {
            mkdirSync(tmpFolderPath);
          }

          try {
            // جلب الفيديو وحفظه
            const videoResponse = await axios.get(videoLink, { responseType: 'arraybuffer' });
            const videoPath = path.join(tmpFolderPath, 'subscribe_video.mp4');
            fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

            // إرسال رسالة الترحيب مع الفيديو
            api.sendMessage(
              {
                body: welcomeMessage,
                attachment: fs.createReadStream(videoPath),
              },
              event.threadID
            );
          } catch (error) {
            // في حالة وجود خطأ عند جلب الفيديو، يتم إرسال رسالة بدون مرفق
            api.sendMessage(welcomeMessage, event.threadID);
            log([
              {
                message: "[ WARNING ]: ",
                color: "yellow",
              },
              {
                message: `⚠️ | فشل في جلب الفيديو الترحيبي من الرابط: ${videoLink}`,
                color: "red",
              },
            ]);
          }
        } else {
          // إذا تم إضافة أعضاء آخرين
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          // تحديث عدد الأعضاء بعد إضافة أشخاص
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
          // إرسال رسالة إشعار بإضافة أشخاص
          api.sendMessage(event.logMessageBody, event.threadID);
        }
        break;
      }
    }
  },
};