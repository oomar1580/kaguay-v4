import { log } from "../logger/index.js";
import fs from "fs";
import axios from "axios";
import path from "path";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    try {
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
          break;
        }

        case "log:subscribe": {
          // إذا تمت إضافة البوت إلى المجموعة
          if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
            // حذف رسالة التوصيل
            api.unsendMessage(event.messageID);

            // تغيير اسم البوت عند إضافته إلى المجموعة
            const botName = "ᏦᏗᎶᏬᎩᏗ ᏕᏗᎷᏗ"; // اسم البوت
            api.changeNickname(
              `》 《 ❃ ➠ ${botName}`,
              event.threadID,
              api.getCurrentUserID()
            );

            // إرسال رسالة التحميل الأولية
            const initialMessage = await api.sendMessage("Accessing...\n████▒▒▒▒▒▒ 31%", event.threadID);

            // تحديث الرسالة تدريجيًا لإظهار تقدم التحميل
            const loadingStages = [
              "Accessing...\n████▒▒▒▒▒▒ 31%",
              "Accessing...\n██████▒▒▒▒ 59%",
              "Accessing...\n███████▒▒▒ 73%",
              "Accessing...\n█████████▒ 88%",
              "Accessing...\nDone ✓\n██████████ 100%"
            ];

            for (const stage of loadingStages) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية واحدة بين كل مرحلة
              await api.editMessage(stage, initialMessage.messageID);
            }

            // رسالة الترحيب عند إضافة البوت فقط
            const welcomeMessage = `✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  |  اكتب قائمة او اوامر او تقرير في حالة واجهتك أي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n ⪨༒𓊈𒆜𝔨𝔞𝔤𝔲𝔶𝔞 𝔠𝔥𝔞𝔫 𒆜𓊉༒⪩ \n╼╾─────⊹⊱⊰⊹─────╼╾\n❏ رابـط الـمـطـور : \nhttps://www.facebook.com/profile.php?id=100076269693499`;

            // إرسال رسالة الترحيب النهائية
            await api.editMessage(welcomeMessage, initialMessage.messageID);

          } else {
            // إذا تم إضافة أعضاء آخرين، فقط إنشاء حسابات المستخدمين دون تحديث عدد الأعضاء
            for (let i of event.logMessageData.addedParticipants) {
              await Users.create(i.userFbId);
            }
          }
          break;
        }
      }
    } catch (error) {
      log([
        {
          message: "[ ERROR ]: ",
          color: "red",
        },
        {
          message: `حدث خطأ: ${error.message || error}`,
          color: "green",
        },
      ]);
    }
  },
};
