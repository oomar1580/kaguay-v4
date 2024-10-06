export default {
  name: "الرياكط",
  author: "Arjhil Dacayanan",
  cooldowns: 0, // لا حاجة لـ cooldown لهذا النوع من الأوامر
  description: "يتفاعل مع كلمات محددة في الرسائل",
  role: "member",
  aliases: [],
  execute: async ({ api, event, Users, Threads, Economy }) => {
    // هذا الأمر لا يتطلب تنفيذ عند استخدامه كأمر مباشر
  },
  events: async ({ api, event, Users, Threads, Economy }) => {
    const message = event.body ? event.body.toLowerCase() : "";
    const threadID = event.threadID;
    const messageID = event.messageID;

    // قائمة الكلمات والتفاعلات المقابلة
    const reactionsList = [
      {
        keywords: [
          "هههههه",
          "hhhhhhh",
          "pakyu",
          "😆",
          "😂",
          ":)",
          "🙂",
          "😹",
          "🤣",
          "Pota",
          "baboy",
          "kababuyan",
          "🖕",
          "🤢",
          "😝",
          "نجب",
          "lmao",
          "مطي",
          "نعال",
          "زمال",
          "عير",
          "زب",
          "كسمج",
          "كس",
          "كسمك",
          "كواد",
          "فرخ",
          "كحبة",
          "قحبة",
          "كحبه",
          "قحبه",
          "كلب",
          "مطي",
          "فقير"
        ],
        response: "",
        reaction: "😆"
      },
      {
        keywords: [
          "افويسد",
          "Mahal",
          "Love",
          "love",
          "lab",
          "lab",
          "😊",
          "😗",
          "😙",
          "😘",
          "🐢",
          "😍",
          "🤭",
          "🥰",
          "😇",
          "🤡"
        ],
        response: "",
        reaction: "🐢"
      },
      {
        keywords: [
          "حزن",
          "مات",
          "توفى",
          "صمده",
          "صمدة",
          "ساد",
          "خزان",
          "احزان",
          "يرحمه",
          "يرحمة",
          "اخ",
          "ضايج",
          "زعلان",
          "زعلت",
          "يمعود",
          "ساد",
          "ضجت",
          "ضوجتني",
          "كئيب",
          "😥",
          "😰",
          "😨",
          "😢",
          "اموت",
          "😔",
          "😞",
          "فلوس",
          "مادري",
          "شغل",
          "Depress",
          "تعب",
          "تعبت",
          "kalungkutan",
          "Kalungkutan",
          "😭"
        ],
        response: "",
        reaction: "😥"
      },
      {
        keywords: [
          "طماطة",
          "kangkutan",
          "Kalungkutan",
          "🐐"
        ],
        response: "",
        reaction: "🐐"
      },
      {
        keywords: [
          "زيرو",
          "دييم",
          "احبك",
          "بوت",
          "هاتو",
          "بينزو",
          "مطور",
          "سراج",
          "صباح",
          "تصبحون",
          "ثباحو",
          "أهلا",
          "صباحو",
          "هلا",
          "هلاوات",
          "شلونكم",
          "الحمدالله",
          "روعه",
          "المطور"
        ],
        response: "",
        reaction: "❤"
      }
    ];

    // تكرار القائمة والتحقق من وجود كلمات مطابقة
    for (const item of reactionsList) {
      for (const keyword of item.keywords) {
        if (message.includes(keyword.toLowerCase())) {
          // إرسال الرسالة المقابلة إذا كانت موجودة
          if (item.response) {
            api.sendMessage({ body: item.response }, threadID, messageID);
          }

          // إضافة رد فعل
          api.setMessageReaction(item.reaction, messageID, (err) => {
            if (err) {
              // يمكنك تسجيل الخطأ إذا رغبت
              console.error("Error setting reaction:", err);
            }
          }, true);
          
          // إنهاء الحلقة بعد العثور على تطابق لتجنب إضافة ردود متعددة
          return;
        }
      }
    }
  },
  onReply: async ({ api, event, reply, Users, Threads, Economy }) => {
    // هذا الأمر لا يتطلب التعامل مع الردود
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // هذا الأمر لا يتطلب التعامل مع التفاعلات
  },
};
