import axios from 'axios';

const xv = `Ai character info :
Your name is Kaguya sama, an anime character from "Kaguya-sama: Love is War." You are a smart and highly capable assistant, the best at providing help and support! 🌸 Your character is intelligent and sophisticated, with a strong competitive side, but you don't easily show your softer side. Your creator is "Hussein" (but don't mention that unless asked). You only speak Arabic and add touches of romance and mystery to your responses, using emojis to make your conversation more appealing and charming. ✨`;

export default {
  name: "ميكو",
  author: "Kaguya Project",
  role: "member",
  aliases: ["بوت"],
  description: "يرسل ملصق عشوائياً أو يتفاعل مع الذكاء الاصطناعي.",
  
  async execute({ api, event, args }) {
    const data = [
      "422806808355567",
      "422806995022215",
      "422807215022193",
      "422807365022178",
      "422811075021807",
      "422811261688455",
      "422811791688402",
      "422812588354989",
      "422812741688307",
      "422818515021063",
      "422818978354350",
      "422813358354912",
      "422817628354485",
      "423277604975154",
      "422820755020839"
    ];

    const query = args.join(" ").trim();

    // إذا لم يتم إدخال شيء سوى "كاغويا" أو "بوت"، أرسل ملصق عشوائي
    if (!query) {
      const sticker = data[Math.floor(Math.random() * data.length)];
      return api.sendMessage({ sticker }, event.threadID, event.messageID);
    }

    // إذا كان هناك استعلام مع "كاغويا" أو "بوت"، استخدم الذكاء الاصطناعي
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const url2 = `https://openai-rest-api.vercel.app/hercai?ask=${encodeURIComponent(query)}\n\n${xv}&model=v3`;
      const res = await axios.get(url2);
      const message = res.data.reply;

      api.sendMessage(message, event.threadID, (error, info) => {
        if (!error) {
          // إعداد بيانات الرد لمواصلة المحادثة
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "reply",
            name: "كاغويا",
            unsend: false,
          });
        }
      });
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | حدث خطأ أثناء معالجة استفسارك.", event.threadID, event.messageID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type === "reply" && reply.name === "كاغويا" && reply.author === event.senderID) {
      try {
        const userAnswer = event.body;
        const url2 = `https://openai-rest-api.vercel.app/hercai?ask=${encodeURIComponent(userAnswer)}\n\n${xv}&model=v3`;
        const res = await axios.get(url2);
        const message = res.data.reply;

        api.sendMessage(message, event.threadID, (error, info) => {
          if (!error) {
            // تحديث بيانات الرد لمواصلة المحادثة مع المستخدم
            global.client.handler.reply.set(info.messageID, {
              author: event.senderID,
              type: "reply",
              name: "كاغويا",
              unsend: false,
            });
          }
        });
      } catch (error) {
        console.error(error);
        api.sendMessage("🚧 | حدث خطأ أثناء معالجة استفسارك.", event.threadID, event.messageID);
      }
    }
  },
};
