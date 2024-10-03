import sleep from "time-sleep";

class LocBox {
  constructor() {
    this.name = "تصفية";
    this.author = "Arjhil Dacayanan & Hussein";
    this.cooldowns = 60;
    this.description = "تصفية عدد محدد من الاعضاء او الحسابات المعطلة !";
    this.role = "owner";
    this.aliases = ["filter"];
  }

  async execute({ api, event, Threads, Users, args }) {
    try {
      
      const threadData = (await Threads.find(event.threadID))?.data?.data;
      if (!threadData.adminIDs.includes(api.getCurrentUserID())) {
        return api.sendMessage("⚠️ | يحتاج البوت أن يكون آدمن لإستخدام هذه الميزة", event.threadID);
      }
      
      const [length, filterType] = args.map((arg) => isNaN(arg) ? arg : Number(arg));

      if (isNaN(length) || length <= 0) {
        return api.sendMessage("⚠️ | أرجوك قم بإدخال عدد صحيح !", event.threadID);
      }

      const threads = (await Threads.getAll()).data;
      const findThreads = threads.filter((thread) => thread.data.members < length);

      if (!findThreads.length) {
        return api.sendMessage(`❗ | المجموعة ليست اقل من ${length} عضو !`, event.threadID);
      }

      // في حالة طلب طرد الحسابات المعطلة أو المحظورة
      if (filterType === "die") {
        const allUsers = await Users.find({});
        const bannedUsers = allUsers.filter(user => user.data.banned.status === true);

        if (!bannedUsers.length) {
          return api.sendMessage("❗ | لم يتم إيجاد أي حسابات معطلة او محظورة", event.threadID);
        }

        for (const user of bannedUsers) {
          try {
            await api.removeUserFromGroup(user.uid, event.threadID);
            await sleep(1000);
          } catch (error) {
            console.error(`Failed to remove ${user.data.name}: ${error.message}`);
          }
        }
        return api.sendMessage(`✅ | تمت تصفية ${bannedUsers.length} حساب معطل او محظور !`, event.threadID);
      }

      // فلترة المجموعات بناءً على عدد الأعضاء
      for (const threadData of findThreads) {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadData.threadID);
        await sleep(1000);
      }

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ | حدث خطأ غير متوقع !", event.threadID);
    }
  }
}

export default new LocBox();
