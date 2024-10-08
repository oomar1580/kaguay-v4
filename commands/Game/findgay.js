import axios from "axios";
import fs from "fs-extra";
import path from "path";

export default {
  name: "شاذ",
  author: "Your Name",
  role: "member",
  description: "قم بالبحث عشوائيًا وإرسال اسم الشخص مع صورة قوس قزح لملف تعريفه.",
  execute: async ({ api, event }) => {
    const participantIDs = event.participantIDs;
    const randomUserID = getRandomUserID(participantIDs);

    try {
      // إرسال رسالة مؤقتة أثناء البحث
      const searchingMessage = await new Promise((resolve, reject) => {
        api.sendMessage("🔍 | جاري البحث عن شاذ في المجموعة...", event.threadID, (err, info) => {
          if (err) return reject(err);
          resolve(info);
        });
      });

      // الحصول على معلومات المستخدم العشوائي
      const userInfo = (await api.getUserInfo([randomUserID]))[randomUserID];
      const avatarURL = userInfo.profileUrl;
      const userName = userInfo.name;

      // استدعاء API لإنشاء صورة باستخدام رابط API قوس قزح
      const apiUrl = `https://api-canvass.vercel.app/rainbow?userid=${randomUserID}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const imagePath = path.join(process.cwd(), 'cache', `${randomUserID}_rainbow.jpg`);
      await fs.writeFile(imagePath, Buffer.from(response.data, 'binary'));

      // إرسال الصورة مع اسم الشخص
      const msgOptions = {
        body: `🏳️‍🌈 | هذا الشخص المسمى بـ ${userName} هو شاذ !`,
        attachment: fs.createReadStream(imagePath)
      };

      await api.sendMessage(msgOptions, event.threadID);

      // حذف الصورة بعد الإرسال
      await fs.unlink(imagePath);

      // حذف رسالة "جاري البحث"
      api.unsendMessage(searchingMessage.messageID);

    } catch (error) {
      console.error('Error generating image:', error);
      api.sendMessage("❌ حدث خطأ أثناء توليد الصورة.", event.threadID);
    }
  }
};

// دالة لاختيار مستخدم عشوائي من المشاركين في المحادثة، باستثناء معرفات معينة
function getRandomUserID(participantIDs) {
  const filteredIDs = participantIDs.filter(id => id !== "100060340563670" && id !== "100082247235177" && id !== "100047481257472" && id !== "61552229885334");
  return filteredIDs[Math.floor(Math.random() * filteredIDs.length)];
}
