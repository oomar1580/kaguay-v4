import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "أغنية",
  author: "Hussein Yacoubi", // api by cliff 
  role: "member",
  aliases: ["اغنية", "غني", "سبوتيفاي", "موسيقى"],
  description: "يقوم بجلب اغاني من سبوتيفاي وارسالها",

  async execute({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const query = event.body.slice(event.body.indexOf(" ")).trim();  // extract search query

    if (!query) {
      return api.sendMessage("⚠️ | يرجى إدخال اسم الأغنية للبحث.", threadID, messageID);
    }

    try {
      // Sending a waiting message
      const waitMessage = await api.sendMessage("⏱️ | جاري البحث عن الأغنية المطلوبة ، يرجى الانتظار...", threadID);

      // Fetch songs from the Spotify API
      const response = await axios.get(`https://betadash-api-swordslush.vercel.app/spotify/search?q=${query}&apikey=syugg`);
      const songData = response.data.data.slice(0, 4); // Fetch the top 4 results

      if (songData.length === 0) {
        api.unsendMessage(waitMessage.messageID);
        return api.sendMessage("⚠️ | لم يتم العثور على أي أغاني!", threadID, messageID);
      }

      let songList = "";
      songData.forEach((song, index) => {
        songList += `${index + 1}. 🎵 | العنوان: ${song.title}\n🌟 | الشعبية: ${song.popularity}\n\n`;
      });

      // Remove waiting message and send the song list
      api.unsendMessage(waitMessage.messageID);
      api.sendMessage({
        body: `🎶 | نتائج البحث:\n\n${songList}🔢 | الرجاء الرد برقم الأغنية لتحميلها.`,
      }, threadID, (err, info) => {
        if (err) return console.error("Error sending song list:", err);

        // Store reply data for song selection
        global.client.handler.reply.set(info.messageID, {
          author: senderID,
          type: "pick",
          name: "أغنية", // Adding name property here
          songData,
          unsend: true
        });
      }, messageID);

    } catch (error) {
      console.error('Error fetching Spotify API:', error.message);
      api.unsendMessage(waitMessage.messageID);
      api.sendMessage(`⚠️ | حدث خطأ أثناء استدعاء API!\n${error.message}`, threadID, messageID);
    }
  },

  async onReply({ api, event, reply }) {
    const { author, songData, type, name } = reply;

    // Ensure only the command sender can reply and check for the correct name
    if (type === "pick" && event.senderID === author && name === "أغنية") {
      const selectedIndex = parseInt(event.body.trim());

      if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > songData.length) {
        return api.sendMessage("⚠️ | يرجى إدخال رقم صالح بين 1 و 4.", event.threadID, event.messageID);
      }

      const selectedSong = songData[selectedIndex - 1];

      // Fetch the song preview (if available) and send it
      try {
        const songPath = path.resolve(process.cwd(), `song_preview.mp3`);
        const writer = fs.createWriteStream(songPath);

        const response = await axios({
          url: selectedSong.preview,
          method: 'GET',
          responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
          api.sendMessage({
            body: `🎵 | تم اختيار الأغنية: ${selectedSong.title}\n👤 | المؤلف: ${selectedSong.artist}\n🌟 | الشعبية: ${selectedSong.popularity}\n\n📛 | اسم الأغنية: ${selectedSong.title}`,  // Added name
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
