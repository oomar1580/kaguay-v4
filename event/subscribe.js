import { log } from "../logger/index.js";
import fs from "fs";
import axios from "axios";
import path from "path";

// Function to send a welcome message with an image
async function sendWelcomeMessage(api, threadID, message, attachmentPath) {
  try {
    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(attachmentPath),
    }, threadID);
  } catch (error) {
    console.error('Error sending welcome or farewell message:', error);
  }
}

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    // Fetch thread data
    var threads = (await Threads.find(event.threadID))?.data?.data;

    // Check if the thread data exists
    if (!threads) {
      await Threads.create(event.threadID);
    }

    switch (event.logMessageType) {
      case "log:unsubscribe": {
        // If the bot is removed from the group
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
        // Update the member count after a user leaves
        await Threads.update(event.threadID, {
          members: +threads.members - 1,
        });
        break;
      }

      case "log:subscribe": {
        // If the bot is added to the group
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // Unsend the delivery message
          api.unsendMessage(event.messageID);

          // Change the bot's nickname when added to the group
          const botName = "كاغويا"; // Bot name
          api.changeNickname(
            `》 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // Welcome message when only the bot is added
          const welcomeMessage = `✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  |  اكتب قائمة او اوامر او تقرير في حالة واجهتك أي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n ⪨༒𓊈𒆜𝔨𝔞𝔤𝔲𝔶𝔞 𝔠𝔥𝔞𝔫 𒆜𓊉༒⪩ \n╼╾─────⊹⊱⊰⊹─────╼╾\n❏ رابـط الـمـطـور : \nhttps://www.facebook.com/profile.php?id=100076269693499`;

          // Path to the image you want to send with the welcome message
          const imagePath = path.join(process.cwd(), "cache12/welcom.gif");

          // Send the welcome message with the image
          await sendWelcomeMessage(api, event.threadID, welcomeMessage, imagePath);

        } else {
          // If other participants are added, just update the member count without messages
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          // Update the member count after new participants are added
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
        }
        break;
      }
    }
  },
};
