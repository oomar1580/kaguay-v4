import axios from 'axios';
import fs from 'fs';
import path from 'path';

class Help {
  constructor() {
    this.name = "اوامر";
    this.author = "Kaguya Project";
    this.cooldowns = 60;
    this.description = "عرض قائمة الأوامر مع كيفية استعمال كل واحد!";
    this.role = "member";
    this.aliases = ["أوامر", "الاوامر"];
    this.commands = global.client.commands;
    this.tempFolder = path.join(process.cwd(), 'temp');

    // مصفوفة الصور العشوائية
    this.randomImageUrls = [
      "https://i.postimg.cc/ncSwYctL/1198010.jpg",
      "https://i.postimg.cc/x81SxfT1/4k-popstar-ahri-asu-lol-skin-splash-art-4k-wallpaper-pixground.jpg",
      "https://i.postimg.cc/kG3TGwL3/4k-Rising-Legend-Ahri-Skin-League-Of-Legends-4-K-Wallpaper.jpg",
      "https://i.postimg.cc/VsKSY5t4/foxfire-ahri-asu-lol-skin-splash-art-4k-wallpaper-pixground-768x432.jpg",
      "https://i.postimg.cc/ZKZCFpST/o-Nh-Ocuu-QQ78g-Ylow6r-Xoyefy8-L166-G0-H1u-Ame-Mtq.jpg",
      "https://i.postimg.cc/hvtNc2mD/undefined-Imgur.jpg",
      "https://i.postimg.cc/WbbSYDmv/Utool-20240705-090316235.jpg",
      "https://i.postimg.cc/264p8q36/wallpapersden-com-new-ahri-league-of-legends-1920x1080.jpg" 
    ];
  }

  async execute({ api, event, args }) {
    api.setMessageReaction("📝", event.messageID, (err) => {}, true);

    const [pageStr] = args;
    const page = parseInt(pageStr) || 1;
    const commandsPerPage = 10;
    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = page * commandsPerPage;

    const commandList = Array.from(this.commands.values());
    const totalPages = Math.ceil(commandList.length / commandsPerPage);
    const totalCommands = commandList.length;

    if (pageStr && typeof pageStr === 'string' && pageStr.toLowerCase() === 'الكل') {
      let allCommandsMsg = "╭───────────────◊\n•——[قائمة جميع الأوامر]——•\n";
      
      commandList.forEach((command) => {
        const commandName = command.name.toLowerCase();
        allCommandsMsg += `❏ الإسم : 『${commandName}』\n`;
      });

      allCommandsMsg += `إجمالي عدد الأوامر: ${totalCommands} أمر\n╰───────────────◊`;
      await api.sendMessage(allCommandsMsg, event.threadID);
    } else if (!isNaN(page) && page > 0 && page <= totalPages) {
      let msg = `\n•—[قــائــمــة أوامــر مــيــكــو]—•\n`;

      const commandsToDisplay = commandList.slice(startIndex, endIndex);
      commandsToDisplay.forEach((command, index) => {
        const commandNumber = startIndex + index + 1;
        msg += `[${commandNumber}] ⟻『${command.name}』\n`;
      });

      msg += `✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏✎\nالصفحة: ${page}/${totalPages}\nإجمالي عدد الأوامر: ${totalCommands} أمر\n🔖 | اكتب 'أوامر رقم الصفحة' لرؤية الصفحات الأخرى.\n 🧿 | اكتب 'أوامر الكل' لرؤية جميع الأوامر.`;

      const randomImageUrl = this.randomImageUrls[Math.floor(Math.random() * this.randomImageUrls.length)];
      const tempImagePath = path.join(this.tempFolder, `random_image_${Date.now()}.jpeg`);

      try {
        const imageResponse = await axios.get(randomImageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));
        const attachment = fs.createReadStream(tempImagePath);

        await api.sendMessage({ body: msg, attachment }, event.threadID);
      } catch (error) {
        console.error("حدث خطأ: ", error);
        await api.sendMessage("❌ | حدث خطأ أثناء جلب الصورة.", event.threadID);
      }
    } else {
      await api.sendMessage("❌ | الصفحة غير موجودة.", event.threadID);
    }
  }
}

export default new Help();
