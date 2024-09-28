import { log } from "../logger/index.js";
import moment from "moment-timezone";
import fs from "fs";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    var threads = (await Threads.find(event.threadID))?.data?.data || {};
    if (!threads) {
      await Threads.create(event.threadID);
    }

    switch (event.logMessageType) {
      case "log:unsubscribe":
        {
          if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
            await Threads.remove(event.threadID);
            return log([
              {
                message: "[ THREADS ]: ",
              color: "yellow",
              },
              {
                message: ` ❌ | المجموعة مع المعرف : ${event.threadID} قامت بطرد البوت خارجا `,
                color: "green",
              },
            ]);
          }
          await Threads.update(event.threadID, {
            members: +threads.members - 1,
          });
          break; // إزالة إرسال رسالة المغادرة
        }

      case "log:subscribe": {
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة توصيل كاغويا
          api.unsendMessage(event.messageID);

          // تغيير كنية البوت تلقائيا عند الإضافة إلى المجموعة
          const botName = "ⓀⒶⒼⓊⓎⒶ"; // اسم البوت يدويا
          api.changeNickname(
            `》 ${global.client.config.prefix} 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // رسالة الترحيب مع فيديو الترحيب عند دخول البوت فقط
          const videoPath = "cache12/welcome.mp4";
          api.sendMessage(
            {
              body: `┌───── ～✿～ ─────┐\n✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n❏ رابـط الـمـطـور : https://www.facebook.com/profile.php?id=100076269693499 \n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  | اكتب قائمة او اوامر \n╼╾─────⊹⊱⊰⊹─────╼╾\n🔖 | أكتب تقريرلإرسال رسالة للمطور في حالة واجهت اي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n〘🎀 KᗩGᑌYᗩ ᗷOT 🎀〙\n└───── ～✿～ ─────┘`,
          
              attachment: fs.createReadStream(videoPath),
            },
            event.threadID
          );
        } else {
          // تحديث عدد الأعضاء فقط دون إرسال رسالة ترحيب
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
        }
        break; // إزالة إرسال رسالة الترحيب
      }
    }
  },
};
