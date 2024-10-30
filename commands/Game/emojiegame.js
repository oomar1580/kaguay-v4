import fs from "fs";
import path from "path";
import axios from "axios";

const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

let activeGame = null;

export default {
    name: "لعبة-ايموجي",
    author: "kaguya project",
    role: "member",
    description: "تخمين الإيموجي من خلال الوصف",
    execute: async function ({ api, event, Economy }) {
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
            ];

            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const correctAnswer = randomQuestion.answer;

            const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t🌟 | أرسل الإيموجي الصحيح حسب الوصف التالي :\n${randomQuestion.question}`;

            api.sendMessage(message, event.threadID, (error, info) => {
                if (!error) {
                    activeGame = {
                        correctEmoji: correctAnswer,
                        author: event.senderID,
                        messageID: info.messageID
                    };
                } else {
                    console.error("خطأ في إرسال الرسالة:", error);
                }
            });
        } catch (error) {
            console.error("خطأ في تنفيذ الأمر:", error);
        }
    },
    events: async function ({ api, event }) {
        if (activeGame && event.body === activeGame.correctEmoji && event.senderID === activeGame.author) {
            try {
                api.unsendMessage(activeGame.messageID); // حذف الرسالة عند الإجابة الصحيحة

                api.getUserInfo(event.senderID, (err, result) => {
                    if (err) {
                        console.error("خطأ في جلب معلومات المستخدم:", err);
                        return;
                    }

                    const userName = result[event.senderID].name;
                    const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
                    const userPoints = pointsData[event.senderID] || { name: userName, points: 0 };
                    userPoints.points += 50; // زيادة النقاط للإجابة الصحيحة
                    pointsData[event.senderID] = userPoints;
                    fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

                    api.sendMessage(`✅ | إجابة صحيحة! ${userName}، لقد حصلت على 50 نقطة!`, event.threadID);
                    activeGame = null; // إنهاء اللعبة الحالية بعد الإجابة الصحيحة
                });
            } catch (error) {
                console.error("خطأ في معالجة الإجابة:", error);
            }
        } else if (activeGame && event.senderID === activeGame.author) {
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            api.sendMessage("❌ | إجابة خاطئة، حاول مرة أخرى!", event.threadID);
        }
    }
};
