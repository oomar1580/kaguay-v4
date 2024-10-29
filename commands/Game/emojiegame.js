import fs from "fs";
import path from "path";
import axios from "axios";

const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "لعبة-ايموجي",
    author: "kaguya project",
    role: "member",
    description: "تخمين الإيموجي من خلال الوصف",
    execute: async function ({ api, event, Economy, client }) {
        try {
            const questions = [
                { question: "رجل شرطه", answer: "👮‍♂️" },
                { question: "امره شرطه", answer: "👮‍♀️" },
                { question: "حزين", answer: "😢" },
                { question: "الاكرهه شبه مبتسم", answer: "🙂" },
                { question: "يخرج لسانه", answer: "😛" },
                { question: "ليس له فم", answer: "😶" },
                { question: "يتثائب", answer: "🥱" },
                { question: "نائم", answer: "😴" },
                { question: "يخرج لسانه ومغمض عين واجده", answer: "😜" },
                { question: "يخرج لسانه وعيناه مغمضه", answer: "😝" },
                { question: "واو", answer: "😮" },
                { question: "مغلق فمه", answer: "🤐" },
                { question: "مقلوب راسه", answer: "🙃" },
                { question: "ينفجر رئسه", answer: "🤯" },
                { question: "يشعر بل حر", answer: "🥵" },
                { question: "بالون", answer: "🎈" },
                { question: "عيون", answer: "👀" },
                { question: "ماعز", answer: "🐐" },
                { question: "الساعة الثانيه عشر", answer: "🕛" },
                { question: "كره قدم", answer: "⚽" },
                { question: "سله تسوق", answer: "🛒" },
                { question: "دراجه هوائيه", answer: "🚲" },
                { question: "جدي", answer: "🐐" },
                { question: "ضفدع", answer: "🐸" },
                { question: "بوت", answer: "🤖" },
                { question: "قبلة", answer: "💋" },
                { question: "فتى يمسك رأسه بيديه", answer: "🙆" },
                { question: "نجمة براقة", answer: "🌟" },
                { question: "عينين تراقبان بصمت", answer: "👀" },
                { question: "النجدة!", answer: "🆘" },
                { question: "تابوت", answer: "⚰️" },
                { question: "وجه فضائي", answer: "👽" },
                { question: "مقلة ، عين ، زرقاء", answer: "🧿" },
                { question: "حاسوب", answer: "💻" },
                { question: "مشبك الورق", answer: "📎" },
                { question: "سيف الأزرق السحري البراق", answer: "🗡️" },
                { question: "جدار أحمر مبني من الطوب", answer: "🧱" },
                { question: "مغناطيس", answer: "🧲" },
                { question: "زهرة الساكورا", answer: "💮" },
                { question: "شبكة كرة القدم", answer: "🥅" },
                { question: "ماسة", answer: "💎" },
                { question: "أحمر الشفاه", answer: "💄" },
                { question: "ورق الحمام", answer: "🧻" },
                { question: "ميدالية المركز الأول", answer: "🥇" },
                // الأسئلة الأخرى هنا
            ];

            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const correctAnswer = randomQuestion.answer;

            const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t🌟 | أرسل الإيموجي الصحيح حسب الوصف التالي :\n${randomQuestion.question}`;

            api.sendMessage(message, event.threadID, async (error, info) => {
                if (!error) {
                    client.handler.messageEvent.set(event.threadID, {
                        correctAnswer: correctAnswer,
                        author: event.senderID,
                        messageID: info.messageID
                    });
                } else {
                    console.error("خطأ في إرسال الرسالة:", error);
                }
            });
        } catch (error) {
            console.error("خطأ في تنفيذ الأمر:", error);
        }
    },
    events: async function ({ api, event, client }) {
        const messageData = client.handler.messageEvent.get(event.threadID);
        
        if (messageData && event.senderID === messageData.author) {
            const userAnswer = event.body.trim();
            if (userAnswer === messageData.correctAnswer) {
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                api.sendMessage("✅ | إجابة صحيحة! لقد حصلت على 50 نقطة!", event.threadID);

                // إزالة الحدث من الذاكرة وحذف الرسالة
                client.handler.messageEvent.delete(event.threadID);
                api.unsendMessage(messageData.messageID);
            } else {
                api.setMessageReaction("❌", event.messageID, (err) => {}, true);
                api.sendMessage("❌ | إجابة خاطئة، حاول مرة أخرى!", event.threadID);
            }
        }
    }
};
