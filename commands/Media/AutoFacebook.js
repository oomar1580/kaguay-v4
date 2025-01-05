import axios from "axios";
import path from "path";
import fs from "fs-extra";

class VideoDownloader {
  name = "فيس";
  author = "kaguya project";
  role = "member";
  description =
    "تنزيل مقاطع الفيديو من Facebook باستخدام رابط URL.";

  async execute({ api, event }) {
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

    const link = event.body.trim();
    const downloadingMsg = await api.sendMessage("⏳ | جـارٍ تـنـزيـل الـمـقـطـع...", event.threadID);

    try {
      // استخدام رابط API الجديد
      const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl?url=${encodeURIComponent(link)}`;

      // طلب البيانات من API
      const response = await axios.get(apiUrl);
      const mediaData = response.data;

      // تحقق من نجاح الاستجابة وتوفر الفيديو
      if (mediaData?.videoUrl) {
        const videoUrl = mediaData.videoUrl;
        const videoTitle = mediaData.title || "غير معروف";
        const videoQuality = mediaData.quality || "غير معروف";
        const videoThumbnail = mediaData.thumbnail;
        const videoPath = path.join(process.cwd(), "cache", `${Date.now()}.mp4`);
        fs.ensureDirSync(path.join(process.cwd(), "cache"));

        // تحميل الفيديو
        const videoStream = await axios({
          method: "GET",
          url: videoUrl,
          responseType: "stream",
        });

        const fileWriteStream = fs.createWriteStream(videoPath);
        videoStream.data.pipe(fileWriteStream);

        fileWriteStream.on("finish", async () => {
          await api.unsendMessage(downloadingMsg.messageID);
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          await api.sendMessage(
            {
              body: `✅ | تـم تـنـزيـل الـفـيـديـو بـنـجـاح! \n📺 | الـعـنـوان: ${videoTitle}\n🎥 | الـدقـة: ${videoQuality}`,
              attachment: fs.createReadStream(videoPath),
            },
            event.threadID
          );
          fs.unlinkSync(videoPath); // حذف الملف بعد الإرسال
        });

        fileWriteStream.on("error", async (error) => {
          console.error("[ERROR] أثناء كتابة الملف:", error);
          await api.unsendMessage(downloadingMsg.messageID);
          api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", event.threadID);
        });
      } else {
        await api.unsendMessage(downloadingMsg.messageID);
        api.sendMessage("⚠️ | لا يوجد فيديو متاح للتنزيل.", event.threadID);
      }
    } catch (error) {
      console.error("Error fetching or sending video:", error);
      await api.unsendMessage(downloadingMsg.messageID);
      api.sendMessage("⚠️ | حدث خطأ أثناء جلب أو إرسال الفيديو.", event.threadID);
    }
  }

  async events({ api, event }) {
    const { body, threadID } = event;

    if (
      body &&
      /^(https?:\/\/)?(www\.)?(facebook\.com)\/.+$/.test(body)
    ) {
      // إذا أرسل المستخدم رابط فيسبوك صالح، يمكن تفعيل `execute` مباشرة
      this.execute({ api, event });
    }
  }
}

export default new VideoDownloader();
