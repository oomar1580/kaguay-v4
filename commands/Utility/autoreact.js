export default {
  name: "الرياكط",
  author: "kaguya project",
  role: "owner", // أو "admin" حسب الحاجة
  description: "يرد على رسائل محددة بإيموجي معين مع ردود تلقائية بناءً على النصوص.",
  
  async execute({ api, event }) {
    const { body, threadID, messageID } = event;

    // تحويل النص إلى أحرف صغيرة
    let react = body?.toLowerCase() || "";

    // التفاعل مع النصوص بناءً على الكلمات المفتاحية
    if (react.includes("هههههه") || react.includes("hhhhhhh") || react.includes("pakyu") || react.includes("😆") || react.includes("😂") || react.includes(":)") || react.includes("🙂") || react.includes("😹") || react.includes("🤣") || react.includes("Pota") || react.includes("baboy") || react.includes("kababuyan") || react.includes("🖕") || react.includes("🤢") || react.includes("😝") || react.includes("نجب") || react.includes("lmao") || react.includes("مطي") || react.includes("نعال") || react.includes("زمال") || react.includes("عير") || react.includes("زب") || react.includes("كسمج") || react.includes("كس") || react.includes("كسمك") || react.includes("كواد") || react.includes("فرخ") || react.includes("كحبة") || react.includes("قحبة") || react.includes("كحبه") || react.includes("قحبه") || react.includes("كلب") || react.includes("مطي") || react.includes("فقير")) {
      await api.setMessageReaction("😆", messageID, (err) => {}, true);
    } 
    else if (react.includes("افويسد") || react.includes("Mahal") || react.includes("Love") || react.includes("love") || react.includes("lab") || react.includes("lab") || react.includes("😊") || react.includes("😗") || react.includes("😙") || react.includes("😘") || react.includes("🐢") || react.includes("😍") || react.includes("🤭") || react.includes("🥰") || react.includes("😇") || react.includes("🤡")) {
      await api.setMessageReaction("🐢", messageID, (err) => {}, true);
    } 
    else if (react.includes("حزن") || react.includes("مات") || react.includes("توفى") || react.includes("صمده") || react.includes("صمدة") || react.includes("ساد") || react.includes("خزان") || react.includes("احزان") || react.includes("يرحمه") || react.includes("يرحمة") || react.includes("اخ") || react.includes("ضايج") || react.includes("زعلان") || react.includes("زعلت") || react.includes("يمعود") || react.includes("ساد") || react.includes("ضجت") || react.includes("ضوجتني") || react.includes("كئيب") || react.includes(" 😥") || react.includes("😰") || react.includes("😨") || react.includes("😢") || react.includes("اموت") || react.includes("😔") || react.includes("😞") || react.includes("فلوس") || react.includes("مادري") || react.includes("شغل") || react.includes("Depress") || react.includes("تعب") || react.includes("تعبت") || react.includes("ملل") || react.includes("Kalungkutan") || react.includes("😭")) {
      await api.setMessageReaction("😥", messageID, (err) => {}, true);
    } 
    else if (react.includes("زيرو") || react.includes("دييم") || react.includes("احبك") || react.includes("بوت") || react.includes("هاتو") || react.includes("بوتة") || react.includes("مطور") || react.includes("حسين") || react.includes("صباح") || react.includes("تصبحون") || react.includes("ثباحو") || react.includes("كاغويا") || react.includes("صباحو") || react.includes("هلا") || react.includes("هلاوات") || react.includes("شلونكم") || react.includes("الحمدالله") || react.includes("روعه") || react.includes("المطور")) {
      await api.setMessageReaction("❤", messageID, (err) => {}, true);
    }
  },
async events({ event, Threads, Users, api }) {
    const { threadID, senderID, body, messageID } = event;

    // افترض أن لديك معرف البوت
    const botID = api.getCurrentUserID(); // يحدد معرف البوت الحالي

    // تجاهل الرسائل الصادرة من البوت
    if (senderID === botID) return;

    let react = body?.toLowerCase() || "";

    if (react.includes("هههههه") || react.includes("hhhhhhh") || react.includes("pakyu") || react.includes("😆") || react.includes("😂") || react.includes(":)") || react.includes("🙂") || react.includes("😹") || react.includes("🤣") || react.includes("Pota") || react.includes("baboy") || react.includes("kababuyan") || react.includes("🖕") || react.includes("🤢") || react.includes("😝") || react.includes("نجب") || react.includes("lmao") || react.includes("مطي") || react.includes("نعال") || react.includes("زمال") || react.includes("عير") || react.includes("زب") || react.includes("كسمج") || react.includes("كس") || react.includes("كسمك") || react.includes("كواد") || react.includes("فرخ") || react.includes("كحبة") || react.includes("قحبة") || react.includes("كحبه") || react.includes("قحبه") || react.includes("كلب") || react.includes("مطي") || react.includes("فقير")) {
      await api.setMessageReaction("😆", messageID, (err) => {}, true);
    }
    else if (react.includes("افويسد") || react.includes("Mahal") || react.includes("Love") || react.includes("love") || react.includes("lab") || react.includes("lab") || react.includes("😊") || react.includes("😗") || react.includes("😙") || react.includes("😘") || react.includes("🐢") || react.includes("😍") || react.includes("🤭") || react.includes("🥰") || react.includes("😇") || react.includes("🤡")) {
      await api.setMessageReaction("🐢", messageID, (err) => {}, true);
    } 
    else if (react.includes("حزن") || react.includes("مات") || react.includes("توفى") || react.includes("صمده") || react.includes("صمدة") || react.includes("ساد") || react.includes("خزان") || react.includes("احزان") || react.includes("يرحمه") || react.includes("يرحمة") || react.includes("اخ") || react.includes("ضايج") || react.includes("زعلان") || react.includes("زعلت") || react.includes("يمعود") || react.includes("ساد") || react.includes("ضجت") || react.includes("ضوجتني") || react.includes("كئيب") || react.includes(" 😥") || react.includes("😰") || react.includes("😨") || react.includes("😢") || react.includes("اموت") || react.includes("😔") || react.includes("😞") || react.includes("فلوس") || react.includes("مادري") || react.includes("شغل") || react.includes("Depress") || react.includes("تعب") || react.includes("تعبت") || react.includes("ملل") || react.includes("Kalungkutan") || react.includes("😭")) {
      await api.setMessageReaction("😥", messageID, (err) => {}, true);
    } 
    else if (react.includes("زيرو") || react.includes("دييم") || react.includes("احبك") || react.includes("بوت") || react.includes("هاتو") || react.includes("بوتة") || react.includes("مطور") || react.includes("حسين") || react.includes("صباح") || react.includes("تصبحون") || react.includes("ثباحو") || react.includes("كاغويا") || react.includes("صباحو") || react.includes("هلا") || react.includes("هلاوات") || react.includes("شلونكم") || react.includes("الحمدالله") || react.includes("روعه") || react.includes("المطور")) {
      await api.setMessageReaction("❤", messageID, (err) => {}, true);
    }
  },
};
