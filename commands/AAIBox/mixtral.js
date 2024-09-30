import fetch from 'node-fetch';

export default {
  name: "إنضمام",
  author: "Kaguya Project",
  role: "member",
  aloases:["join","انضمام"],
  description: "يرسل قائمة بالمجموعات المتاحة للانضمام ويتيح للمستخدم اختيار مجموعة والانضمام إليها.",
  async execute({ api, event, args }) {
    try {
      const groupList = await api.getThreadList(10, null, ['INBOX']);
      const filteredList = groupList.filter(group => group.threadName !== null);

      if (filteredList.length === 0) {
        return api.sendMessage('⚠️ | لم يتم ايجاد اي مجموعة', event.threadID, event.messageID);
      }

      const formattedList = filteredList.map((group, index) =>
        `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
      );
      const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${formattedList.map(line => `${line}`).join("\n")}\n╰───────────ꔪ\nالحد الأقصى من الأعضاء = 250\n\nرد.بـ رقم المجموعة اللتي ترغب في الإنضمام إليها`;

      const sentMessage = await api.sendMessage(message, event.threadID);

      // إعداد الرد للاستمرار في المحادثة
      global.client.handler.reply.set(sentMessage.messageID, {
        author: event.senderID,
        type: "pick",
        name: "إنضمام",
        unsend: true,
      });

    } catch (error) {
      console.error("Error listing group chats", error);
      return api.sendMessage('❌ | حدث خطأ أثناء محاولة الحصول على المجموعات.', event.threadID, event.messageID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type === "pick" && reply.name === "إنضمام" && reply.author === event.senderID) {
      const groupIndex = parseInt(event.body.trim(), 10);

      if (isNaN(groupIndex) || groupIndex <= 0) {
        return api.sendMessage('❌ | أنت لم ترد برقم صحيح، حاول مرة أخرى.', event.threadID, event.messageID);
      }

      try {
        const groupList = await api.getThreadList(10, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (groupIndex > filteredList.length) {
          return api.sendMessage('⚠️ | الرقم الذي أدخلته غير صحيح، حاول مرة أخرى.', event.threadID, event.messageID);
        }

        const selectedGroup = filteredList[groupIndex - 1];
        const groupID = selectedGroup.threadID;

        // تحقق إذا كان المستخدم موجود مسبقاً في المجموعة
        const memberList = await api.getThreadInfo(groupID);
        if (memberList.participantIDs.includes(event.senderID)) {
          return api.sendMessage(`⚠️ | أنت موجود مسبقاً في هذه المجموعة: ${selectedGroup.threadName}`, event.threadID, event.messageID);
        }

        // تحقق إذا كانت المجموعة ممتلئة
        if (memberList.participantIDs.length >= 250) {
          return api.sendMessage(`⚠️ | لا يمكن إضافتك، المجموعة ممتلئة: ${selectedGroup.threadName}`, event.threadID, event.messageID);
        }

        // إضافة المستخدم إلى المجموعة
        await api.addUserToGroup(event.senderID, groupID);
        return api.sendMessage(`✅ | تمت إضافتك بنجاح إلى المجموعة: ${selectedGroup.threadName}`, event.threadID, event.messageID);

      } catch (error) {
        console.error("Error joining group chat", error);
        return api.sendMessage('❌ | حدث خطأ أثناء محاولة إضافتك إلى المجموعة، حاول مرة أخرى لاحقاً.', event.threadID, event.messageID);
      }
    }
  }
};
