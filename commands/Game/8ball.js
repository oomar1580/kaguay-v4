export default {
    name: 'كرة-الحظ',
    author: 'HUSSEIN YACOUBI',
    role: 'member',  // Adjust role if needed
    description: '🔮 اسألني أي سؤال وأنا سأجيب عليك بطريقة عشوائية.',
    aliases:["8ball"],
    execute: async ({ api, event, args }) => {
        if (args.length === 0) {
            return api.sendMessage('⚠️ | من فضلك، اسأل سؤالاً بعد /8ball', event.threadID);
        }

        const question = args.join(' ');
        const responses = [
            'من المؤكد', 'من المؤكد جدًا', 'بدون شك', 'نعم بالتأكيد',
            'يمكنك الاعتماد على ذلك', 'كما أراه، نعم', 'على الأرجح', 'مؤشرات إيجابية',
            'نعم', 'الإشارات تشير إلى نعم', 'الجواب غير واضح، حاول مرة أخرى',
            'اسألني لاحقًا', 'من الأفضل أن لا أخبرك الآن', 'لا أستطيع التنبؤ الآن', 'ركز واسأل مرة أخرى',
            'لا تعتمد على ذلك', 'جوابي هو لا', 'مصادري تقول لا', 'المستقبل ليس جيدًا',
            'من غير المحتمل'
        ];

        // Send progress update before generating response
        let progressMessage = await api.sendMessage('████▒▒▒▒▒▒ 31%', event.threadID);
        setTimeout(async () => {
            await api.editMessage(progressMessage.messageID, '██████▒▒▒▒ 59%', event.threadID);
            setTimeout(async () => {
                await api.editMessage(progressMessage.messageID, '███████▒▒▒ 73%', event.threadID);
                setTimeout(async () => {
                    await api.editMessage(progressMessage.messageID, '█████████▒ 88%', event.threadID);
                    setTimeout(async () => {
                        await api.editMessage(progressMessage.messageID, '██████████ 100%', event.threadID);

                        // Generate random response after progress bar completion
                        const response = responses[Math.floor(Math.random() * responses.length)];
                        await api.sendMessage(`🌀 سـؤالـك: ${question}\n📝 الـجـواب: ${response}`, event.threadID);

                        // React to the message with a success mark
                        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                    }, 500); // Final message edit after progress bar is complete
                }, 500);
            }, 500);
        }, 500);
    }
};
