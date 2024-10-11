import axios from "axios";
import fs from "fs";
import path from "path";

class AutoSeen {
  name = "ڤيو";
  author = "Thiệu Trung Kiên";
  cooldowns = 60;
  description = "انظر رسائل المستخدم!";
  role = "owner";
  aliases = ["رؤية"];
  config = false;

  // This will be triggered for events
  async events({ api }) {
    this.config && api.markAsReadAll(() => {});
  }

  // This function will fetch an attachment (image, video, or GIF) and send it with the message
  async fetchAndSendAttachment(api, threadID) {
    try {
      // Example URL of an image, GIF, or video to download
      const fileUrl = "https://i.postimg.cc/mgtRQ0Y8/welcom.gif"; // Replace with actual URL

      // File path to save the downloaded attachment
      const filePath = path.join(process.cwd(), "cache", "attachment.gif");

      // Send waiting message and get the message ID to unsend later
      const waitingMessage = await api.sendMessage("⏱️ | جاري المعالجة يرجى الإنتظار...", threadID);
      const waitingMessageID = waitingMessage.messageID;

      // Downloading the file
      const response = await axios({
        method: "GET",
        url: fileUrl,
        responseType: "stream",
      });

      // Saving the file to disk
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      // Once the download is complete, send the message with the attachment
      writer.on("finish", async () => {
        // Delete the waiting message
        await api.unsendMessage(waitingMessageID);

        // Send the final message with the attachment
        await api.sendMessage(
          {
            body: `${this.config ? " تم تفعيل الرؤية التلقائية ✅" : "تم تعطيل الرؤية التلقائية ❌"}`,
            attachment: fs.createReadStream(filePath),
          },
          threadID
        );
      });
    } catch (error) {
      console.error("Error fetching and sending attachment:", error);
      await api.sendMessage("حدث خطأ أثناء إرسال المرفق.", threadID);
    }
  }

  // This method toggles the configuration and sends a message with an attachment
  async execute({ api, event }) {
    this.config = !this.config;

    // Send message with an attachment and a waiting message
    await this.fetchAndSendAttachment(api, event.threadID);
  }
}

export default new AutoSeen();
