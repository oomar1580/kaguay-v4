import sleep from "time-sleep";

class LocBox {
  constructor() {
    this.name = "تصفية";
    this.author = "Arjhil Dacayanan & Hussein";
    this.cooldowns = 60;
    this.description = "تصفية الحسابات المعطلة او المحظورة !";
    this.role = "owner";
    this.aliases = ["filter"];
  }

  async execute({ api, event, Users, args }) {
    try {
      const filterType = args[0];

      // في حالة طلب طرد الحسابات المعطلة أو المحظورة
      if (filterType === "die") {
        const allUsers = await Users.find({});
        const bannedUsers = allUsers.filter(user => user.data.banned.status === true);

        if (!bannedUsers.length) {
          return kaguya.reply("❗ | لم يتم إيجاد أي حسابات معطلة أو محظورة.");
        }

        for (const user of bannedUsers) {
          try {
            await api.removeUserFromGroup(user.uid, event.threadID);
            await sleep(1000);
          } catch (error) {
            console.error(`Failed to remove ${user.data.name}: ${error.message}`);
          }
        }
        return kaguya.reply(`✅ | تمت تصفية ${bannedUsers.length} حساب معطل أو محظور!`);
      } else {
        return kaguya.reply("❓ | الرجاء إدخال نوع الفلترة الصحيح. استخدم 'die' لإزالة الحسابات المعطلة.");
      }

    } catch (error) {
      console.error(error);
      return kaguya.reply("❌ | حدث خطأ غير متوقع!");
    }
  }
}

export default new LocBox();
