export default {
    name: "بايو",
    author: "Arjhil Dacayanan",
    role: "owner",
    cooldowns: 10,
    description: "قم بتغيير بايو البوت وعدل غلى الرسالة",
    async execute({ api, args, event }) {
        try {
            const content = args.join(" ") || "";

            // Send initial message saying the bio is being updated
            const initialMessage = await api.sendMessage("\n━━━━━━━━━━━━━━━━━━\n⏱️ |جاري رفع بايو البوت الجديد ، يرجى الإنتظار....\n━━━━━━━━━━━━━━━━━━\n", event.threadID);

            // Update the initial message with the new bio info
            const editedMessage = `✅ | تم رفع بايو البوت الى :\n━━━━━━━━━━━━━━━━━━\n ${content}\n━━━━━━━━━━━━━━━━━━\n`;
            await api.editMessage(editedMessage, initialMessage.messageID);
        } catch (err) {
            console.error(err);
        }
    },
};
