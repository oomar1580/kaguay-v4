import axios from 'axios';

let isChatEnabled = true; // متغير للتحكم في تشغيل/إيقاف الدردشة

export default {
  name: "شات",
  author: "Kaguya Project",
  role: "member",
  description: "يدردش معك ويرد برسالة فقط.",
  aliases: ["سيم", "تشغيل-الدردشة", "ايقاف-الدردشة"],

  async execute({ api, event }) {
    const { threadID, messageID, body } = event;

    if (body === "تشغيل-الدردشة") {
      isChatEnabled = true;
      return api.sendMessage("✅ | تم تفعيل الدردشة التلقائية.", threadID, messageID);
    } else if (body === "ايقاف-الدردشة") {
      isChatEnabled = false;
      return api.sendMessage("❌ | تم إيقاف الدردشة التلقائية.", threadID, messageID);
    } else {
      // تنبيه المستخدم في حال إرسال رسالة دون تفعيل الدردشة
      return api.sendMessage("🗨️ | يمكنك تشغيل الدردشة باستخدام 'تشغيل-الدردشة' أو إيقافها باستخدام 'ايقاف-الدردشة'.", threadID, messageID);
    }
  },

  events: async function ({ api, event }) {
    if (!isChatEnabled) return; // إذا كانت الدردشة غير مفعلة، تجاهل الأحداث

    const { threadID, body, messageID } = event;

    if (!body || body.trim() === "") return; // إذا لم يتم إدخال أي نص، تجاهل الحدث

    try {
      const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
      const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

      // إرسال الرد النصي فقط
      api.sendMessage(replyMessage, threadID, messageID);
    } catch (error) {
      console.error("Error during chat:", error);
      api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID, messageID);
    }
  }
};
