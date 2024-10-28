export default {
  name: "messageResponses",
  author: "YourName",
  description: "Responds to specific Arabic messages with predefined replies",
  execute({ api, event }) {
    const threadID = event.threadID;

    // Ensure that event.body exists and is a string
    if (!event.body || typeof event.body !== 'string') return;

    const lowerBody = event.body.toLowerCase();

    if (lowerBody === "احبك" || lowerBody === "أحبك") {
      return api.sendMessage("ها يمعود مو هنا", threadID);
    }

    if (lowerBody === "شكرا" || lowerBody === "شكرا يا بوت") {
      return api.sendMessage("العفو هذا واجب", threadID);
    }

    if (lowerBody === "عضمة" || lowerBody === "عضمه") {
      return api.sendMessage("ماكس التميت سوبر عضمة", threadID);
    }

    if (lowerBody === "صباح الخير" || lowerBody === "صباح") {
      return api.sendMessage("صباح الخير و السرور و باقات الزهور", threadID);
    }

    if (lowerBody === "كيفكم" || lowerBody === "شلونكم") {
      return api.sendMessage("بخير حياتي ماذا عنك!", threadID);
    }

    if (lowerBody === "اتفق" || lowerBody === "أتفق") {
      return api.sendMessage("اطلق من يتفق", threadID);
    }

    if (lowerBody === "السلام عليكم" || lowerBody === "سلام") {
      return api.sendMessage("و؏ٌٍـلًِيٌِگِـٍٍّّـًـًٍ(🌹)ٌٍـٌٍـًٌٍم السـ͜(🤝)ـلاﺂ͘م وݛحـٍّْـٍّْ⁽😘₎ـٍّْمهہ الًـًٍٍۖـٍۖ(☝)ٍۖـًٍٍٍّـًٍلۖهًٍۖۂ وبـۗـۗـۗـۗـۗـۗركۧۧـ(ۗ😇)ـۗـۗاتهۂ", threadID);
    }

    // Add more cases for other phrases...

    if (lowerBody === "وداعا" || lowerBody === "أنا ذاهب") {
      return api.sendMessage("وداعا مع السلامه آمل أن نراك قريبا ☺️", threadID);
    }

    if (lowerBody === "هلو" || lowerBody === "هلا") {
      return api.sendMessage("هلاوات ❤️", threadID);
    }

    if (lowerBody === "بوت غبي") {
      return api.sendMessage("وأنت أغبى يا مخ العصفور", threadID);
    }

    if (lowerBody === "مساء الخير") {
      return api.sendMessage("مساء النور و السرور و الورد المنثور <3", threadID);
    }

    if (lowerBody === "👍") {
      return api.sendMessage("جرب ضغط لايك مرة أخرى و راح تشوف 🙂🔪", threadID);
    }

    if (lowerBody === "أنا جائع") {
      return api.sendMessage("زدني عليك أتمنى أن أتناول الشكولاتة 🥺 :>>", threadID);
    }

    if (lowerBody === "تصبحون على خير" || lowerBody === "تصبح على خير") {
      return api.sendMessage("وأنت من أهله أتمنى لك أحلاما بدون كوابيس", threadID);
    }

    // Continue adding more message conditions as needed...
  }
};
