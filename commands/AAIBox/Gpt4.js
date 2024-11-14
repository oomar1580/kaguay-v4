import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "كوبل",
  author: "Kisara",
  role: "member",
  description: "احصل على صورة متحركة للرقص",
  async execute({ api, event }) {
    try {
      // React to the message with a heart emoji
      api.setMessageReaction("💘", event.messageID, () => {}, true);

      // API endpoint for fetching a dancing GIF
      const BASE_URL = `https://api.elianabot.xyz/api/couple.php`;

      // Fetch the GIF URL from the API
      const response = await axios.get(BASE_URL);
      const danceURL = response.data.gif_url;

      if (danceURL) {
        const cachePath = path.join(process.cwd(), "cache", "dance.gif");

        // Fetch the GIF as a stream and save it to the cache folder
        const imageResponse = await axios.get(danceURL, { responseType: "stream" });
        const writer = fs.createWriteStream(cachePath);

        imageResponse.data.pipe(writer);

        writer.on("finish", async () => {
          const form = {
            body: "كــوبــل 💖",
            attachment: fs.createReadStream(cachePath)
          };

          // Send the GIF as a message
          await api.sendMessage(form, event.threadID, async () => {
            // Delete the GIF from cache after sending
            await fs.unlink(cachePath);
          });
        });

        writer.on("error", async (err) => {
          console.error(err);
          await api.sendMessage("❌ | حدث خطأ أثناء حفظ صورة الرقص.", event.threadID);
        });
      } else {
        await api.sendMessage("❌ | حدث خطأ أثناء جلب الكوبل", event.threadID);
      }
    } catch (error) {
      console.error(error);
      await api.sendMessage("❌ | حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  }
};
