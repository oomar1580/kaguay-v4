import axios from "axios";
import request from "request";
import fs from "fs";

export default {
  name: "تحميل",
  author: "kaguya project",
  role: "member",
  description: "تنزيل مقاطع الفيديو أو الصور من تيك توك أو يوتيوب أو بنتريست.",

  execute: async ({ api, event, args, Economy }) => {
    api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 500;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً من أجل تنزيل مقطع أو صورة. يمكنك تنزيل مقاطع من تيك توك، فيسبوك، بنتريست، يوتيوب، انستغرام.`, event.threadID);
    }

    // الخصم من الرصيد
    await Economy.decrease(cost, event.senderID);

    try {
      const description = args.join(" ");
      if (!description) {
        api.sendMessage(
          "[!] يجب تقديم وصف الفيديو أو الصورة للمتابعة.",
          event.threadID,
          event.messageID
        );
        return;
      }

      // Fetch user data to get the user's name
      const userInfo = await api.getUserInfo(event.senderID);
      const senderName = userInfo[event.senderID].name;

      // Send initial message
      const sentMessage = await api.sendMessage(
        `🕟 | مرحبًا @${senderName}، جارٍ تنزيل المحتوى، الرجاء الانتظار...`,
        event.threadID
      );

      // تحديد الرابط الجديد
      const apiUrl = `https://www.samirxpikachu.run.place/alldl?url=${encodeURIComponent(description)}`;

      const response = await axios.get(apiUrl);
      const mediaData = response.data;

      if (!mediaData || !mediaData.medias || !mediaData.medias.length) {
        api.sendMessage("⚠️ | لم أتمكن من العثور على محتوى بناءً على الوصف المقدم. يرجى المحاولة مرة أخرى.", event.threadID);
        return;
      }

      // البحث عن الفيديو أو الصورة في قائمة الوسائط
      const videoInfo = mediaData.medias.find(media => media.videoAvailable);
      const imageInfo = mediaData.medias.find(media => !media.videoAvailable);

      let mediaUrl, fileType, messageBody, filePath;

      if (videoInfo) {
        mediaUrl = videoInfo.url;
        fileType = 'mp4';
        filePath = `${process.cwd()}/cache/video.mp4`;
        messageBody = `╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم تحميل الفيديو:\n❀ العنوان: ${mediaData.title}\n⏱️ المدة: ${mediaData.duration}\n╼╾─────⊹⊱⊰⊹─────╼╾`;
      } else if (imageInfo) {
        mediaUrl = imageInfo.url;
        fileType = 'jpg';
        filePath = `${process.cwd()}/cache/image.jpg`;
        messageBody = `╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم تحميل الصورة:\n❀ العنوان: ${mediaData.title}\n╼╾─────⊹⊱⊰⊹─────╼╾`;
      } else {
        api.sendMessage("⚠️ | لم أتمكن من العثور على محتوى صالح للتنزيل. يرجى المحاولة مرة أخرى.", event.threadID);
        return;
      }

      // تأكد من أن الرابط صالح بالتحقق من استجابة HTTP
      request.head(mediaUrl, (err, res) => {
        if (err || res.statusCode !== 200) {
          api.sendMessage("⚠️ | الرابط الذي تم الحصول عليه غير صالح أو المحتوى غير متاح.", event.threadID);
          return;
        }

        // قم بتنزيل الفيديو أو الصورة وإرسالها من المسار المؤقت
        const mediaStream = request(mediaUrl).pipe(fs.createWriteStream(filePath));
        mediaStream.on("close", () => {
          api.unsendMessage(sentMessage.messageID); // حذف الرسالة التي تم التفاعل معها ب "⬇️"
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          api.sendMessage(
            {
              body: messageBody,
              attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            () => fs.unlinkSync(filePath) // حذف الملف بعد الإرسال
          );
        });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء تنزيل المحتوى. يرجى المحاولة مرة أخرى.", event.threadID);
    }
  },
};
