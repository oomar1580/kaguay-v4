import axios from "axios";

export default {
  name: "رابط",
  author: "Arjhil Dacayanan",
  cooldowns: 10,
  description: "رفع الصور الى موقع Imgur",
  role: "member",
  aliases: ["imgur"],

  async execute({ api, event }) {
    const client = axios.create({
      baseURL: "https://smfahim.xyz/",
    });

    const uploadImage = async (url) => {
      const response = await client.get(`imgur?url=${encodeURIComponent(url)}`);
      return response.data.uploaded.image; // استخدام الرابط الذي تحصل عليه من النتيجة
    };

    const array = [];

    if (event.type !== "message_reply" || event.messageReply.attachments.length === 0) {
      return api.sendMessage("⚠️ | رد على صورة", event.threadID);
    }

    for (const { url } of event.messageReply.attachments) {
      try {
        const res = await uploadImage(url);
        array.push(res);
      } catch (err) {
        console.log(err);
      }
    }

    return api.sendMessage(`» تم رفع ${array.length} صورة بنجاح\nفشل رفع : ${array.length - event.messageReply.attachments.length}\n» رابط.الصورة:\n${array.join("\n")}`, event.threadID);
  },
};
