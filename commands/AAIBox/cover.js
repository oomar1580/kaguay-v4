import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "غلاف",
  author: "HUSSEIN YACOUBI",
  role: "member",
 aliases:["كوفر"],
  description: "قم بانشاء غلاف خاص بك.",
  
  execute: async ({ api, event }) => {
    const { threadID, senderID } = event;
    
    // بدء العملية بطلب الاسم
    api.sendMessage("👤 | أرجوك قم بالرد على هذه الرسالة و أدخل إسمك الشخصي بالإنجليزية ", threadID, (err, message) => {
      global.client.handler.reply.set(message.messageID, {
        author: senderID,
        type: "name",
        name:"غلاف",
        collectedData: {},
        unsend: true
      });
    });
  },

  onReply: async ({ api, event, reply }) => {
    const messageBody = event.body.trim();

    if (reply.author !== event.senderID) return; // التحقق من أن المستخدم هو نفسه
    let collectedData = reply.collectedData || {};

    switch (reply.type) {
      case "name":
        collectedData.name = messageBody;
        api.sendMessage("✅ | تم حفظ الإسم بنجاح \n 👤 | الآن قم بإدخال إسمك العائلي ", event.threadID, (err, message) => {
          global.client.handler.reply.set(message.messageID, {
            author: event.senderID,
            type: "last",
            name:"غلاف",
            collectedData,
            unsend: true
          });
        });
        break;
      
      case "last":
        collectedData.last = messageBody;
        api.sendMessage("✅ | تم حفظ الإسم العائلي بنجاح \n📱 | الآن قم بإدخال رقم الهاتف الخاص بك :", event.threadID, (err, message) => {
          global.client.handler.reply.set(message.messageID, {
            author: event.senderID,
            type: "phone",
             name:"غلاف",
            collectedData,
            unsend: true
          });
        });
        break;
      
      case "phone":
        collectedData.phone = messageBody;
        api.sendMessage("✅ | تم حفظ رقم الهاتف بنجاح \n 🌍 | الآن قم بإدخال إسم دولتك :", event.threadID, (err, message) => {
          global.client.handler.reply.set(message.messageID, {
            author: event.senderID,
            type: "country",
            name:"غلاف",
            collectedData,
            unsend: true
          });
        });
        break;

      case "country":
        collectedData.country = messageBody;
        api.sendMessage("✅ | تم حفظ إسم الدولة بنجاح \n✉️ | المرجو إدخال الإيميل :", event.threadID, (err, message) => {
          global.client.handler.reply.set(message.messageID, {
            author: event.senderID,
            type: "email",
            name:"غلاف",
            collectedData,
            unsend: true
          });
        });
        break;

      case "email":
        collectedData.email = messageBody;
        api.sendMessage("✅ | تم حفظ إسم دولتك بنجاح \n 🎨 | قم بإدخال اللون المفضل عندك بالإنحليزية :", event.threadID, (err, message) => {
          global.client.handler.reply.set(message.messageID, {
            author: event.senderID,
            type: "color",
            name:"غلاف",
            collectedData,
            unsend: true
          });
        });
        break;

      case "color":
        collectedData.color = messageBody;

 api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);
  
        // بعد جمع كل المعلومات، الآن سنقوم بإنشاء الغلاف
        const { name, last, phone, country, email, color } = collectedData;
        const apiUrl = `https://joshweb.click/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(last)}&sdt=${encodeURIComponent(phone)}&address=${encodeURIComponent(country)}&email=${encodeURIComponent(email)}&uid=${event.senderID}&color=${encodeURIComponent(color)}`;

        try {
          const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
          const coverPath = path.resolve(process.cwd(), `cache/fbcover_${event.senderID}.png`);
          fs.writeFileSync(coverPath, response.data);

api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
          api.sendMessage({
  body: "✅ | تـفـضـل الـغـلاف الـخـاص بـك :",
  attachment: fs.createReadStream(coverPath)
}, event.threadID, () => {
  fs.unlinkSync(coverPath); // حذف الصورة بعد الإرسال
});
          
        } catch (error) {
          console.error(error);
          api.sendMessage("❌ | Sorry, there was an error generating your Facebook cover.", event.threadID, event.messageID);
        }
        break;

      default:
        api.sendMessage("⚠️ | Unexpected input. Please try again.", event.threadID, event.messageID);
        break;
    }
  }
};
