import axios from 'axios';

async function gpt4(prompt, customId) {
  try {
    // استدعاء API الجديد لجلب الرد من ChatGPT
    const apiUrl = `https://betadash-api-swordslush.vercel.app/gpt4?ask=${encodeURIComponent(prompt)}&uid=${customId}`;
    const res = await axios.get(apiUrl);
    const gptResponse = res.data.content;  // استخدام الحقل content بدلاً من gpt3

    return gptResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  name: "ذكاء",
  author: "Kaguya Project",
  role: "member",
  description: "يتفاعل مع الذكاء الاصطناعي ويواصل المحادثة",

  execute: async function({ api, event, args }) {
    try {
      // إضافة تفاعل بالساعة لإعلام المستخدم بالمعالجة
      api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

      const { threadID, senderID } = event;
      const prompt = args.join(" ") || "أهلاً";
      const response = await gpt4(prompt, senderID);

      // تغيير التفاعل إلى نجمة بعد الحصول على الرد
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);

      // إرسال الرد من ChatGPT
      const sentMessage = await api.sendMessage(response, threadID);
      global.client.handler.reply.set(sentMessage.messageID, {
        author: senderID,
        type: "reply",
        name: "ذكاء",
        unsend: false,
      });

      // حذف رسالة الانتظار بعد الإرسال
      api.unsendMessage(event.messageID);

    } catch (error) {
      api.sendMessage(`❌ | حدث خطأ: ${error.message}`, event.threadID);
    }
  },

  onReply: async function({ api, event, reply }) {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        // التعامل مع رد المستخدم وإعادة إرسالها إلى ChatGPT
        const response = await gpt4(event.body, event.senderID);
        const sentMessage = await api.sendMessage(response, event.threadID);

        // تحديث الرد ليكون استمرارية للمحادثة
        global.client.handler.reply.set(sentMessage.messageID, {
          author: event.senderID,
          type: "reply",
          name: "ذكاء",
          unsend: false,
        });

        // إضافة التفاعل ب ⬇️ عند الرد بـ تم
        if (event.body.trim().toLowerCase() === "تم") {
          api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);
        }
      } catch (error) {
        api.sendMessage(`❌ | حدث خطأ أثناء معالجة ردك: ${error.message}`, event.threadID);
      }
    }
  }
};
