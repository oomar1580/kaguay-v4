import axios from "axios";
import fs from "fs";

const emojiJSON = JSON.parse(fs.readFileSync("./cache12/emoji/emoji.json", "utf-8"));

export default {
  name: "دمج",
  author: "Arjhil Dacayanan",
  role: "member",
  cooldowns: 10,
  description: "دمج بين اثنين من الإيموجي",

  async execute({ api, args, event }) {
    const [emoji_1, emoji_2] = args;

    if (!emoji_1 || !emoji_2) {
      return api.sendMessage("⚠️ | ارجوك قم بادخالها بهذه الشاكلة\nمثال  دمج 😎 😇 ولاتنسى مسافة بين الإيموجيان", event.threadID);
    }

    if (!emojiJSON.includes(emoji_1) || !emojiJSON.includes(emoji_2)) {
      return api.sendMessage("⚠️ | الإيموجي الاذي ادخلته غير مدعوم", event.threadID);
    }

    try {
      const mix = await axios.get(encodeURI(`https://tenor.googleapis.com/v2/featured?key=AIzaSyACvEq5cnT7AcHpDdj64SE3TJZRhW-iHuo&client_key=emoji_kitchen_funbox&q=emoji_kitchen_funbox&q=${emoji_1}_${emoji_2}&collection=emoji_kitchen_v6&contentfilter=high`));

      if (!mix.data.results.length) {
        return api.sendMessage("⚠️ | غير قادرة على دمج هذان الإيموجيان غير مدعومان", event.threadID);
      }

      const { png_transparent: { url } } = mix.data.results[0].media_formats;
      const getImg = await axios.get(url, { responseType: "stream" });

      return api.sendMessage({
        body: `✅ | تـم بنجاح : تم دمج هذا ${emoji_1} مع هذا ${emoji_2} :`,
        attachment: getImg.data
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error("An error occurred: ", error);
      return api.sendMessage("❌ |حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
    }
  },
};