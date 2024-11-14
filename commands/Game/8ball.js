export default {
  name: 'كرة-الحظ',
  author: 'HUSSEIN YACOUBI',
  role: 'member',
  description: '🔮 اسألني أي سؤال وأنا سأجيب عليك بطريقة عشوائية.',
  aliases: ["8ball"],
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

    try {
      // إرسال رسالة مبدئية
      const initialMessage = await api.sendMessage("⏱️ | جـارٍ الـتـنـبـئ...", event.threadID);

      // تحديث الرسالة بشكل متتابع لمحاكاة تقدم العملية
      setTimeout(async () => {
        await api.editMessage("████▒▒▒▒▒▒ 31%", initialMessage.messageID);
        setTimeout(async () => {
          await api.editMessage("██████▒▒▒▒ 59%", initialMessage.messageID);
          setTimeout(async () => {
            await api.editMessage("███████▒▒▒ 73%", initialMessage.messageID);
            setTimeout(async () => {
              await api.editMessage("█████████▒ 88%", initialMessage.messageID);
              setTimeout(async () => {
                await api.editMessage("██████████ 100%", initialMessage.messageID);

                // توليد استجابة عشوائية بعد اكتمال شريط التقدم
                const response = responses[Math.floor(Math.random() * responses.length)];
                await api.sendMessage(`🌀 سـؤالـك: ${question}\n📝 الـجـواب: ${response}`, event.threadID);

                // التفاعل مع الرسالة الأصلية بإشارة نجاح
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                
api.unsendMessage(initialMessage.messageID);
                
              }, 500);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  }
};
