import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "أغنية",
  author: "Hussein Yacoubi", 
  role: "member",
  aliases: ["اغنية", "غني", "سبوتيفاي", "موسيقى"],
  description: "يقوم بجلب أغاني من سبوتيفاي وارسالها",

  async execute({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const query = event.body.slice(event.body.indexOf(" ")).trim();  // استخراج الاستعلام

    if (!query) {
      return api.sendMessage("⚠️ | يرجى إدخال اسم الأغنية للبحث.", threadID, messageID);
    }

    try {
      // إرسال رسالة انتظار
      const waitMessage = await api.sendMessage("⏱️ | جاري البحث عن الأغنية المطلوبة، يرجى الانتظار...", threadID);

      // استدعاء Spotify API الجديد
      const response = await axios.get(`https://c-v1.onrender.com/api/spotify/v1?query=${query}`);
      const songData = response.data.slice(0, 4); // جلب أفضل 4 نتائج

      if (songData.length === 0) {
        api.unsendMessage(waitMessage.messageID);
        return api.sendMessage("⚠️ | لم يتم العثور على أي أغاني!", threadID, messageID);
      }

      let songList = "";
      songData.forEach((song, index) => {
        songList += `${index + 1}. 🎵 | العنوان: ${song.name}\n👤 | المؤدي: ${song.artists.join(", ")}\n📀 | الألبوم: ${song.album}\n\n`;
      });

      // إزالة رسالة الانتظار وإرسال قائمة الأغاني
      api.unsendMessage(waitMessage.messageID);
      api.sendMessage({
        body: `🎶 | نتائج البحث:\n\n${songList}🔢 | الرجاء الرد برقم الأغنية لتحميلها.`,
      }, threadID, (err, info) => {
        if (err) return console.error("Error sending song list:", err);

        // حفظ البيانات للرد لاختيار الأغنية
        global.client.handler.reply.set(info.messageID, {
          author: senderID,
          type: "pick",
          name: "أغنية",
          songData,
          unsend: true
        });
      }, messageID);

    } catch (error) {
      console.error('Error fetching Spotify API:', error.message);
      api.sendMessage(`⚠️ | حدث خطأ أثناء استدعاء API!\n${error.message}`, threadID, messageID);
    }
  },

  async onReply({ api, event, reply }) {
    const { author, songData, type, name } = reply;

    // التأكد من أن المرسل هو نفسه المستخدم الذي بدأ البحث
    if (type === "pick" && event.senderID === author && name === "أغنية") {
      const selectedIndex = parseInt(event.body.trim());

      if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > songData.length) {
        return api.sendMessage("⚠️ | يرجى إدخال رقم صالح بين 1 و 4.", event.threadID, event.messageID);
      }

      const selectedSong = songData[selectedIndex - 1];

      // جلب معاينة الأغنية (إذا كانت متاحة) وإرسالها
      try {
        const songPath = path.resolve(process.cwd(), `song_preview.mp3`);
        const writer = fs.createWriteStream(songPath);

        const response = await axios({
          url: selectedSong.preview_url,
          method: 'GET',
          responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
          api.sendMessage({
            body: `🎵 | تم اختيار الأغنية: ${selectedSong.name}\n👤 | المؤدي: ${selectedSong.artists.join(", ")}\n📀 | الألبوم: ${selectedSong.album}`,
            attachment: fs.createReadStream(songPath)
          }, event.threadID, () => fs.unlinkSync(songPath), event.messageID);
        });

        writer.on('error', (err) => {
          console.error('Error downloading song preview:', err);
          api.sendMessage("⚠️ | حدث خطأ أثناء تحميل معاينة الأغنية.", event.threadID, event.messageID);
        });

      } catch (error) {
        console.error('Error fetching song preview:', error.message);
        api.sendMessage("⚠️ | حدث خطأ أثناء تحميل معاينة الأغنية.", event.threadID, event.messageID);
      }
    }
  }
};
