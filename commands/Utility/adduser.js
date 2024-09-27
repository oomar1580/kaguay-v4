export default {
  name: "ضفي",
  author: "Kaguya Project",
  cooldowns: 10,
  description: "يقوم بإضافة الاعصاء الى المجموعة",
  role: "member",
  aliases: ["add"],
  async execute({ api, event, args }) {
    try {
      var [url] = args;
      if (!url) return kaguya.reply(`⚠️ | إستخدمه هكذا : ضفي [المعرف أو الرابط]`);

      if (/facebook\.com/.test(url)) {
        var match = url.match(/\b(?:https?:\/\/)?(?:www\.)?(?:m\.|mbasic\.)?facebook\.com\/(?!profile\.php)([a-zA-Z0-9.-]+)(?:\/)?/);
        if (match) url = match[1];
      }

      var entity_id = (await kaguya.findUID(url)).data.entity_id;
      var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(event.threadID);
      if (participantIDs.includes(entity_id)) return kaguya.reply("⚠️ | هذا العضو موجود بالفعل في المجموعة !");

      api.addUserToGroup(entity_id, event.threadID, () => {
        if (approvalMode && !adminIDs.some((item) => item.id === api.getCurrentUserID())) return kaguya.reply("✅ | تمت إضافة العضو إلى قائمة الموافقة بنجاح !");
        return kaguya.reply("✅ | تمت اضافة العضو إلى المجموعة بنجاح !");
      });
    } catch (err) {
      console.log(err);
      kaguya.reply("⚠️ | حدث خطا أثناء محاولة إضافة العضو إلى المجموعة");
    }
  },
};
