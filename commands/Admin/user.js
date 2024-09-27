const userCommand = {
  name: "المستخدم",
  author: "Arjhil Dacayanan",
  cooldowns: 0,
  description: "حظر او رفع الحظر عن شخص ما لسبب ما",
  role: "owner",
  aliases: ["مستخدم", "user"],
  execute: async ({ api, event, Users, args }) => {
    var [type] = args;
    switch (type) {
      case "حظر": {
        return api.sendMessage(` : `, event.threadID, (err, info) => {
          client.handler.reply.set(info.messageID, {
            name: "المستخدم",
            author: event.senderID,
            type: "ban",
          });
        });
      }
      case "رفع": {
        return api.sendMessage(`⚠️ | أرجوك اءا أردت ان تقوم بعمل منشن من احل ان تحظر اب احد على سبيل المثال: المستخدم حظر @1 @2 (يمكنك ان تعمل منشن متعدد)`, event.threadID, (err, info) => {
          client.handler.reply.set(info.messageID, {
            name: "المستخدم",
            author: event.senderID,
            type: "confirm",
            choose: "unban",
          });
        });
      }
    }
  },
  onReply: async ({ api, event, Users, reply }) => {
    switch (reply.type) {
      case "ban": {
        return api.sendMessage(
          `⚠️ | قم بعمل منشن للشخص اللذي تريد حظره او عدة أشخاص مثال :المستخدم حظر @1 @2 (يمكنك عمل منشن لعدة أشخاص)`,
          event.threadID,
          (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: "المستخدم",
              author: event.senderID,
              type: "confirm",
              choose: "ban",
              reason: event.body,
            });
          },
          event.messageID
        );
      }
      case "تأكيد": {
        var msg = "",
          listUID = event.mentions;
        if (!Object.keys(listUID).length) {
          return api.sendMessage(`⚠️ | امر غير صحيح اختر ${reply.choose == "حظر" ? "banning" : "unban"}. المرجو عمل منشن للشخص اللذي تود حظره ${reply.choose == "ban" ? "ban" : "unban"}\n\nمثال :المستخدم حظر @1 @2`, event.threadID, (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: "user",
              author: event.senderID,
              type: "confirm",
              choose: reply.choose,
              reason: event.body,
            });
          });
        }
        for (let [uid, name] of Object.entries(listUID)) {
          var dataUser = await Users.ban(uid, { status: reply.choose == "ban" ? true : false, reason: reply.choose == "ban" ? reply.reason : "" });
          dataUser.status ? (msg += `${uid} - ✅ (${name})\n`) : (msg += `${uid} - ❌ (Null)\n`);
        }
        return api.sendMessage(`[ ${reply.choose == "ban" ? "BAN USER" : "UNBAN USER"} ]\n` + msg + `\n${reply.choose == "ban" ? `\n📃 | سبب الحظر : ${reply.reason}` : ""}\nإجمالي عدد المستخدمين : ${Object.keys(listUID).length} مستخدم\n✅ : بنجاح\n❌ : فشل\n(يرجع الفشل هو عدم وجود بيانات المستخدم في قاعدة البيانات)`, event.threadID, event.messageID);
      }
    }
  },
};

export default userCommand;