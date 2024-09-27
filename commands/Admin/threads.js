class ThreadsCommand {
  constructor() {
    this.name = "المجموعة";
    this.author = "Arjhil Dacayanan";
    this.cooldowns = 0;
    this.description = "حظر او رفع الحظر عن مجموعة معينة من استخدام البوت";
    this.role = "owner";
    this.aliases = ["مجموعة"];
  }

  async execute({ api, event, Users, args, Threads }) {
    if (!event.isGroup) return kaguya.reply("🚫 | هذا الأمر يمكن استخدامه فقط في المجموعات");
    var [type, reason = "لايوحد اي سبب معطى"] = args;
    switch (type) {
      case "قائمة": {
        var { data } = await Threads.getAll();
        var msgArray = data.map((value, index) => {
          return `${index + 1}. المعرف: ${value.threadID} - رفم من أرقام : ${value.data.members}\nإسم المجموعة : ${value.data.name}\n`;
        });
        var msg = msgArray.join("\n");
        return kaguya.reply(`${msg}\n🔖 | رد برقم على المجموعة اللتي تريد حظرها`, (err, info) => {
          client.handler.reply.set(info.messageID, {
            author: event.senderID,
            name: this.name,
            autosend: true,
            type: "ban",
            threadDATA: data,
          });
        });
      }
      case "حظر": {
        var TID = await Threads.ban(event.threadID, { status: true, reason });
        return kaguya.reply(TID.data);
      }
      case "رفع": {
        var TID = await Threads.ban(event.threadID, { status: false, reason: "" });
        console.log(TID);
        return kaguya.reply(`✅ | تم حظر المجموعة مع الآيدي بنجاح : ${event.threadID}`);
      }
      default: {
        var name = client.config.prefix + this.name;
        return kaguya.reply(`❍───────────────❍\n[ المجموعات ]\n${name} حظر <استخدم حظر من احل حظر المجموعات>\n${name} رفع <من أجل رفع الحظر عن المجموعات>\n${name} قائمة <من أجل الحصول على قائمة المجموعات المتوفرة\n❍───────────────❍`);
      }
    }
  }
}

export default new ThreadsCommand();