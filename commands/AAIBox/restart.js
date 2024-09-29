import axios from "axios";

export default {
  name: "كلمةـالسر",
  author: "kaguya project",
  role: "member",
  description: "توليد كلمة سر عشوائية",
  aliases: ["password", "pass"],
  execute: async ({ api, event, args }) => {
    try {
      // تحديد طول كلمة السر بناءً على المدخلات أو التحديد الافتراضي
      let length = args[0] || 5;
      length = Math.min(Math.max(length, 1), 30);

      // إرسال رسالة لتوضيح أن كلمة السر قيد التوليد
      const waitMessage = await api.sendMessage("⚙️ | جاري توليد كلمة سر عشوائية...", event.threadID);

      // الاتصال بـ API لتوليد كلمة السر
      const url = `https://h-paswad-api.vercel.app/generate-password?length=${length}`;
      const response = await axios.get(url);
      const password = response.data.random_password;

      // حذف رسالة الانتظار
      api.unsendMessage(waitMessage.messageID);

      // إرسال كلمة السر المولدة
      return api.sendMessage(`🔑 | تفضل كلمة السر الخاصة بك :\n\n"${password}"`, event.threadID);
    } catch (error) {
      console.error(error);
      // إذا حدث خطأ، حذف رسالة الانتظار وإرسال رسالة الخطأ
      api.unsendMessage(waitMessage.messageID);
      return api.sendMessage("🤖 | تعذر توليد كلمة السر في الوقت الحالي.", event.threadID);
    }
  }
};
