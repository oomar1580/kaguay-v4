class RestartCommand {
  name = "رستر";
  author = "Arjhil Dacayanan";
  cooldowns = 0;
  description = "إعادة تشغيل نظام البوت";
  role = "owner";
  aliases = ["إعادة-التشغيل", "rest"];

  async execute({ api, event, client }) {
    if (!event || !event.threadID || !event.senderID) {
      console.error("Event object is missing critical information.");
      return api.sendMessage("Error: Unable to process the restart command. Event data is missing.", event?.threadID || null);
    }

    if (event.senderID !== "100076269693499") {
      return api.sendMessage("🚫 | تم الرفض ، هذا الامر خاص ب المطور فقط", event.threadID);
    }

    try {
      // Ensure that client.handler and client.handler.reply are initialized
      if (!client.handler) {
        client.handler = {};  // Initialize client.handler if it doesn't exist
      }

      if (!client.handler.reply) {
        client.handler.reply = new Map();  // Initialize reply if it doesn't exist
      }

      await api.sendMessage("🔖 |هل أنت متأكد من أنك تريد إعادة تشغيل كاغويا ؟ رد ب [نعم] من أجل تأكيد ذالك !", event.threadID, (err, info) => {
        if (err) {
          console.error("Error sending message:", err);
          return api.sendMessage("⚠️ |حدث خطأ أثناء إرسال رسالة التأكيد.", event.threadID);
        }

        client.handler.reply.set(info.messageID, {
          name: "رستر",
          author: event.senderID,
          type: "confirm",
        });
      });
    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("❌ | حدث خطأ أثناء بدء عملية إعادة التشغيل.", event.threadID);
    }
  }

  async onReply({ api, event, reply }) {
    if (!event || !event.body || !event.senderID || !event.threadID) {
      console.error("Event object is missing critical information.");
      return;
    }

    if (reply.type === "confirm" && reply.author === event.senderID) {
      if (event.body.toLowerCase() === 'نعم') {
        let countdown = 5;
        try {
          const countdownMessage = await api.sendMessage(`⚙️ |جاري إعادة التشغيل في ${countdown}...`, event.threadID, event.messageID);

          const countdownInterval = setInterval(async () => {
            countdown--;
            if (countdown > 0) {
              try {
                await api.editMessage(`⚙️ |جاري إعادة التشغيل في ${countdown}...`, countdownMessage.messageID);
              } catch (editError) {
                console.error("Error editing message:", editError);
              }
            } else {
              clearInterval(countdownInterval);
              try {
                await api.editMessage(`⚙️ | جارٍ إعادة تشغيل كاغويا...`, countdownMessage.messageID);
              } catch (editError) {
                console.error("Error editing message:", editError);
              }
              console.log('Bot is restarting...');
              process.exit(1);
            }
          }, 1000);
        } catch (messageError) {
          console.error("Error sending countdown message:", messageError);
          return api.sendMessage("❌ | حدث خطأ اثنلء معالجة الأمر", event.threadID);
        }
      } else {
        return api.sendMessage("✅ |تم إعادة تشغيل كاغويا بنجاح", event.threadID);
      }
    }
  }
}

export default new RestartCommand();
