
class NumberGuessingGame {
  name = 'ارقام';
  author = 'Arjhil Dacayanan';
  role = 'member';
  aliases:['أرقام'];
  description = 'لعبة تخمين الرقم بين 1 و 100.';

  // الدالة execute لبدء اللعبة
  async execute({ api, event }) {
    if (!global.numberslst) global.numberslst = {};
    if (!numberslst[event.threadID]) numberslst[event.threadID] = {};

    const s = event.senderID;
    numberslst[event.threadID][s] = {
      active: true,
      numberToGuess: getRandomNumber(1, 100),
      attempts: 0
    };

    await api.sendMessage('حسنا إحزر رقما بين 1 و 100.', event.threadID);
    await api.setMessageReaction("🎲", event.messageID, (err) => {}, true);
  }

  // الدالة events للاستجابة للأحداث من الرسائل
  async events({ event, api }) {
    if (!['message', 'message_reply', 'message_reaction'].includes(event.type)) return;

    const { threadID, senderID, body } = event;
    if (!body || isNaN(parseInt(body))) return; // تجاهل إذا لم تكن الرسالة تحتوي على رقم

    // قم بالاستجابة إذا كانت اللعبة نشطة لهذا المستخدم
    if (global.numberslst && numberslst[threadID] && numberslst[threadID][senderID]) {
      const guessedNumber = parseInt(body);

      const { active, numberToGuess, attempts } = numberslst[threadID][senderID];
      if (!active || isNaN(guessedNumber) || guessedNumber < 1 || guessedNumber > 100) {
        await api.sendMessage({
          body: 'الرجاء إدخال رقم صحيح بين 1 و 100.',
          mentions: [{ tag: senderID, id: senderID }]
        }, threadID);
        await api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return;
      }

      numberslst[threadID][senderID].attempts += 1;

      if (guessedNumber === numberToGuess) {
        const userInfo = await api.getUserInfo(senderID);
        const name = userInfo[senderID].name; // جلب اسم المستخدم

        const rewardAmount = attempts < 10 ? 400 : 200;
        const messageText = attempts < 10 ? "عدد محاولاتك قليل جداً، أداء رائع!" : "محاولاتك كانت كثيرة قليلاً!";

        await api.sendMessage('🥳', threadID);
        await api.sendMessage(`كفوا ${name}! الرقم هو ${numberToGuess} فعلا.\n- ربحت ${rewardAmount} لأن ${messageText}\n- عدد المحاولات: ${attempts}.`, threadID);

        // زيادة المال
        await Economy.increase(rewardAmount, senderID);

        // إنهاء اللعبة
        numberslst[threadID][senderID] = {};
        await api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      } else {
        if (guessedNumber > numberToGuess) {
          await api.sendMessage('⬇️', threadID);
        } else {
          await api.sendMessage('⬆️', threadID);
        }
        await api.setMessageReaction("🔄", event.messageID, (err) => {}, true);
      }
    }
  }
}

// دالة توليد رقم عشوائي
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default new NumberGuessingGame();
