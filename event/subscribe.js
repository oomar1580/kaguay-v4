import { log } from "../logger/index.js";
import fs from "fs";

// تعريف دالة إرسال رسالة الترحيب
async function sendWelcomeMessage(api, threadID, message, attachmentPath) {
  try {
    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(attachmentPath),
    }, threadID);
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    var threads = (await Threads.find(event.threadID))?.data?.data || {};
    if (!threads) {
      await Threads.create(event.threadID);
    }

    switch (event.logMessageType) {
      case "log:unsubscribe": {
        if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
          await Threads.remove(event.threadID);
          return log([
            {
              message: "[ THREADS ]: ",
              color: "yellow",
            },
            {
              message: `❌ | المجموعة مع المعرف : ${event.threadID} قامت بطرد البوت خارجا `,
              color: "green",
            },
          ]);
        }
        await Threads.update(event.threadID, {
          members: +threads.members - 1,
        });
        break;
      }

      case "log:subscribe": {
        // التحقق إذا كان البوت هو الذي تمت إضافته للمجموعة
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة التوصيل
          api.unsendMessage(event.messageID);

          // تغيير كنية البوت تلقائيًا
          const botName = "ⓀⒶⒼⓊⓎⒶ"; // اسم البوت يدويًا
          api.changeNickname(
            `》 ${global.client.config.prefix} 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // إرسال رسالة الترحيب مع فيديو الترحيب عند دخول البوت فقط
          const welcomeMessage = `┌───── ～✿～ ─────┐\n✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n❏ رابـط الـمـطـور : https://www.facebook.com/profile.php?id=100076269693499 \n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  | اكتب قائمة او اوامر \n╼╾─────⊹⊱⊰⊹─────╼╾\n🔖 | أكتب تقرير لإرسال رسالة للمطور في حالة واجهت أي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n〘🎀 KᗩGᑌYᗩ ᗷOT 🎀〙\n└───── ～✿～ ─────┘`;
          const attachmentPath = "cache12/welcome.mp4";
          await sendWelcomeMessage(api, event.threadID, welcomeMessage, attachmentPath);

        } else {
          // إذا انضم شخص آخر، فقط تحديث عدد الأعضاء
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
        }
        break;
      }
    }
  },
};
