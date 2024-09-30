export default {
  name: "إنضمام",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "يعرض قائمة بالدردشات الجماعية والانضمام إلى واحدة منها.",
  cooldowns: 50,
  aliases: ["join", "groups"],
  execute: async ({ api, event }) => {
    try {
      const groupList = await api.getThreadList(300, null, ['INBOX']); 
      const filteredList = groupList.filter(group => group.threadName !== null);

      if (filteredList.length === 0) {
        return api.sendMessage("⚠️ | لم يتم إيجاد أي مجموعة", event.threadID, event.messageID);
      }

      const formattedList = filteredList.map((group, index) =>
        `${index + 1}. ${group.threadName}\n𝐓𝐈𝐃: ${group.threadID}`
      );

      const start = 0;
      const currentList = formattedList.slice(start, start + 5);

      const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${currentList.join("\n")}\n╰───────────ꔪ`;
      const sentMessage = await api.sendMessage(message, event.threadID, event.messageID);

      global.client.handler.reply.set(sentMessage.messageID, {
        author: event.senderID,
        type: 'pick',
        name: 'إنضمام',
        start,
        unsend: true
      });
    } catch (error) {
      console.error("Error listing group chats", error);
      return api.sendMessage("حدث خطأ أثناء محاولة جلب قائمة الدردشات الجماعية.", event.threadID, event.messageID);
    }
  },
  onReply: async ({ api, event, reply }) => {
    if (reply.type !== 'pick') return;

    const { author, start } = reply;

    if (event.senderID !== author) return;

    const userInput = event.body.trim().toLowerCase();

    if (userInput === 'التالي') {
      const nextPageStart = start + 5;
      const nextPageEnd = nextPageStart + 5;

      try {
        const groupList = await api.getThreadList(300, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (nextPageStart >= filteredList.length) {
          return api.sendMessage('لقد وصلت لآخر الصفحة', event.threadID, event.messageID);
        }

        const currentList = filteredList.slice(nextPageStart, nextPageEnd).map((group, index) =>
          `${nextPageStart + index + 1}. ${group.threadName}\n𝐓𝐈𝐃: ${group.threadID}`
        );

        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${currentList.join("\n")}\n╰───────────ꔪ`;
        const sentMessage = await api.sendMessage(message, event.threadID, event.messageID);

        global.client.handler.reply.set(sentMessage.messageID, {
          author: event.senderID,
          type: 'pick',
          name: 'إنضمام',
          start: nextPageStart,
          unsend: true
        });

      } catch (error) {
        console.error("Error loading next page of group chats", error);
        return api.sendMessage('حدث خطأ أثناء تحميل الصفحة التالية من الدردشات الجماعية.', event.threadID, event.messageID);
      }

    } else if (userInput === 'السابق') {
      const prevPageStart = Math.max(start - 5, 0);
      const prevPageEnd = prevPageStart + 5;

      try {
        const groupList = await api.getThreadList(300, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (start === 0) {
          return api.sendMessage('⚠️ | أنت بالفعل في الصفحة الأولى', event.threadID, event.messageID);
        }

        const currentList = filteredList.slice(prevPageStart, prevPageEnd).map((group, index) =>
          `${prevPageStart + index + 1}. ${group.threadName}\n𝐓𝐈𝐃: ${group.threadID}`
        );

        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${currentList.join("\n")}\n╰───────────ꔪ`;
        const sentMessage = await api.sendMessage(message, event.threadID, event.messageID);

        global.client.handler.reply.set(sentMessage.messageID, {
          author: event.senderID,
          type: 'pick',
          name: 'إنضمام',
          start: prevPageStart,
          unsend: true
        });

      } catch (error) {
        console.error("Error loading previous page of group chats", error);
        return api.sendMessage('حدث خطأ أثناء تحميل الصفحة السابقة من الدردشات الجماعية.', event.threadID, event.messageID);
      }

    } else if (!isNaN(userInput)) {
      const groupIndex = parseInt(userInput, 10);

      try {
        const groupList = await api.getThreadList(300, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (groupIndex <= 0 || groupIndex > filteredList.length) {
          return api.sendMessage('رقم المجموعة غير صالح.\nالرجاء اختيار رقم ضمن النطاق.', event.threadID, event.messageID);
        }

        const selectedGroup = filteredList[groupIndex - 1];
        const groupID = selectedGroup.threadID;

        await api.addUserToGroup(event.senderID, groupID);
        return api.sendMessage(`لقد انضممت بنجاح إلى المجموعة: ${selectedGroup.threadName}`, event.threadID, event.messageID);

      } catch (error) {
        console.error("Error joining group chat", error);
        return api.sendMessage('حدث خطأ أثناء الانضمام إلى المجموعة. يرجى المحاولة مرة أخرى لاحقًا.', event.threadID, event.messageID);
      }

    } else {
      return api.sendMessage('⚠️ | إدخال غير صالح.\nيرجى تقديم رقم صالح أو الرد بـ "التالي" أو "السابق".', event.threadID, event.messageID);
    }
  }
};
