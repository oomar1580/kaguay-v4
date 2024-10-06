class antiboximage {
  name = "حماية_الصورة";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "حماية المجموعة من تغيير صورتها!";
  role = "admin";
  aliases = [];

  async execute({ event, Threads }) {
    try {
      var threads = (await Threads.find(event.threadID))?.data?.data;
      var status = threads?.anti?.imageBox ? false : true;
      await Threads.update(event.threadID, {
        anti: {
          imageBox: status,
        },
      });
      return kaguya.reply(`تم ${status ? "✅ تشغيل" : "❌ إطفاء"} ميزة الحماية من تغيير صورة المجموعة`);
    } catch (err) {
      console.error(err);
      return kaguya.reply(" ❌ |لقد حدث خطأ غير متوقع!");
    }
  }
}

export default new antiboximage();
