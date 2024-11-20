import fs from 'fs-extra';
import path from 'path';

const userDataFile = path.join(process.cwd(), 'pontsData.json');

export default {
    name: "صرف",
    author: "kaguya project",
    role: "member",
    description: "تحويل النقاط إلى مال أو المال إلى نقاط باستخدام ملف pontsData.json و Economy.",
    async execute({ api, event, args, Economy }) {
        // الرسالة الأولى لاختيار نوع التحويل
        const initialMessage = 
            "◆━◆🏛 بـنـك الـصـرف 🏛◆━◆\n" +
            "\n» الرجاء اختيار العملية المطلوبة:\n" +
            "\n1. رد بكلمة *نقاط* لتحويل المال إلى نقاط.\n" +
            "\n2. رد بكلمة *نقود* لتحويل النقاط إلى مال.\n" + 
            "\nنقطة = 5 دولار 💵" ;
        const initialResponse = await api.sendMessage(initialMessage, event.threadID);

        global.client.handler.reply.set(initialResponse.messageID, {
            author: event.senderID,
            type: "conversionChoice",
            unsend: true,
            name: "صرف",
        });
    },
    onReply: async function ({ api, event, reply, Economy }) {
        const userData = fs.readJsonSync(userDataFile, { throws: false }) || {};
        const userPoints = userData[event.senderID]?.points || 0;
        const userBalance = (await Economy.getBalance(event.senderID)).data;

        switch (reply.type) {
            case "conversionChoice": {
                // الرد على الاختيار الأول
                const choice = event.body.toLowerCase();
                if (choice === "نقاط") {
                    if (userBalance < 5) {
                        return api.sendMessage("⚠️ | ليس لديك رصيد كافٍ لتحويل المال إلى نقاط. كل نقطة تحتاج إلى 5 دولار.", event.threadID);
                    }
                    const nextMessage = "💰 | الرجاء إدخال الكمية بالدولار التي ترغب في تحويلها إلى نقاط.";
                    const nextResponse = await api.sendMessage(nextMessage, event.threadID);

                    global.client.handler.reply.set(nextResponse.messageID, {
                        author: event.senderID,
                        type: "convertToPoints",
                        unsend: true,
                        name: "صرف",
                    });
                } else if (choice === "نقود") {
                    if (userPoints <= 0) {
                        return api.sendMessage("⚠️ | ليس لديك نقاط كافية لتحويلها إلى مال.", event.threadID);
                    }
                    const nextMessage = "💎 | الرجاء إدخال عدد النقاط التي ترغب في تحويلها إلى مال.";
                    const nextResponse = await api.sendMessage(nextMessage, event.threadID);

                    global.client.handler.reply.set(nextResponse.messageID, {
                        author: event.senderID,
                        type: "convertToMoney",
                        unsend: true,
                        name: "صرف",
                    });
                } else {
                    return api.sendMessage("⚠️ | الرجاء الرد بكلمة *نقاط* أو *نقود* لاختيار العملية.", event.threadID);
                }
                break;
            }
            case "convertToPoints": {
                // تحويل المال إلى نقاط
                const amount = parseInt(event.body);
                if (isNaN(amount) || amount <= 0) {
                    return api.sendMessage("⚠️ | الرجاء إدخال كمية صحيحة من المال للتحويل.", event.threadID);
                }
                if (userBalance < amount) {
                    return api.sendMessage("⚠️ | ليس لديك رصيد كافٍ لتحويل هذا المبلغ إلى نقاط.", event.threadID);
                }

                const points = Math.floor(amount / 5);
                await Economy.decrease(amount, event.senderID);
                userData[event.senderID] = userData[event.senderID] || { points: 0 };
                userData[event.senderID].points += points;
                fs.writeJsonSync(userDataFile, userData);
 

                return api.sendMessage(`✅ | تم تحويل ${amount} دولار إلى ${points} نقاط بنجاح!`, event.threadID);
            }
            case "convertToMoney": {
                // تحويل النقاط إلى مال
                const amount = parseInt(event.body);
                if (isNaN(amount) || amount <= 0) {
                    return api.sendMessage("⚠️ | الرجاء إدخال عدد صحيح من النقاط للتحويل.", event.threadID);
                }
                if (userPoints < amount) {
                    return api.sendMessage("⚠️ | ليس لديك نقاط كافية لتحويل هذا العدد إلى مال.", event.threadID);
                }

                const money = amount * 5;
                userData[event.senderID].points -= amount;
                fs.writeJsonSync(userDataFile, userData);
                await Economy.increase(money, event.senderID);

                return api.sendMessage(`✅ | تم تحويل ${amount} نقاط إلى ${money} دولار بنجاح!`, event.threadID);
            }
        }
    },
};
