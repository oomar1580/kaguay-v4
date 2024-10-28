import axios from 'axios';
import path from 'path';
import fs from 'fs';

export default {
    name: "روايات",
    author: "JakeBot",
    role: "member",
    description: "يبحث عن روايات ويقدم تفاصيل عنها.",
    execute: async ({ api, message, event }) => {
        const msg = `📕🧬| مرحباً بك في عالم السحر و الخيال.
        
←› يرجى الرد على هذه الرسالة بكلمات البحث لاسم التي تعجبك.

⌯︙أنصحك ب ارض زيكولا ✨`;

        api.sendMessage(msg, event.threadID, (error, message) => {
            global.client.handler.reply.set(message.messageID, {
                commandName: "روايات",
                messageID: message.messageID,
                author: event.senderID,
                type: "letsSearch",
                name: "روايات" // إضافة الاسم هنا
            });
        });
    },
    onReply: async ({ api, event, reply }) => {
        const messageBody = event.body.trim().toLowerCase();
        const body = parseInt(messageBody);

        if (reply.type === "letsSearch" && reply.author === event.senderID) {
            const keywords = messageBody;

            try {
                api.setMessageReaction("🔎", event.messageID, (err) => {}, true);
                const response = await axios.get(`https://api-issam-jn6f.onrender.com/wattpad/search/${encodeURIComponent(keywords)}`);
                const mangaData = response.data;
                const numberOfSearch = mangaData.length;

                if (numberOfSearch === 0) {
                    api.setMessageReaction("❌", event.messageID, (err) => {}, true);
                    return api.sendMessage(`❌︙لم يتم العثور على "${keywords}"🫠`, event.threadID);
                }

                let formattedMessage = `〄 تم العثور على ${numberOfSearch} روايات 🔎⤷\n\n`;

                mangaData.forEach((anime, index) => {
                    formattedMessage += `${index + 1}- الاسم ←› ${anime.title}🤍\n`;
                    formattedMessage += `←› البارتات: ${anime.numParts}🗝\n`;
                    formattedMessage += `←› عدد القراء: ${anime.voteCount}✨\n\n`;
                });

                let please = `⌯︙قم بالرد برقم بين 1 و ${numberOfSearch} 🧞‍♂`;
                if (numberOfSearch === 1) {
                    please = "⌯︙ قم بالرد برقم واحد 1.";
                }

                api.sendMessage(
                    `
${formattedMessage}
${please}
`,
                    event.threadID,
                    (error, message) => {
                        global.client.handler.reply.set(message.messageID, {
                            author: event.senderID,
                            name: "روايات", // إضافة الاسم هنا
                            unsend: true,
                            type: "animeResults",
                            result: mangaData,
                        });
                    }
                );
            } catch (error) {
                console.error("Error occurred while fetching anime data:", error);
                return api.sendMessage(`❌︙لم يتم العثور على "${keywords}"🧞‍♂`, event.threadID);
            }
        }

        if (reply.type === "animeResults") {
            try {
                if (isNaN(body) || body < 1 || body > reply.result.length) {
                    return api.sendMessage(`⌯︙قم بالرد برقم بين 1 و ${reply.result.length} 🧞‍♂`, event.threadID);
                }

                const index = body - 1;
                const playUrl = reply.result[index].id;

                const response = await axios.get(`https://api-issam-jn6f.onrender.com/wattpad/infoid/${encodeURIComponent(playUrl)}`);
                const mangaData = response.data;
                const isCompleted = mangaData.completed ? "مكتملة" : "غير مكتملة";

                const msg = `
• ┉ • ┉ • ┉ • ┉ • ┉ •
←› المؤلف : ${mangaData.user.name} ☸
←› الاسم : ${mangaData.title} ☸
←› عدد الاجزاء : ${mangaData.numParts} ✴
←› مكتملة : ${isCompleted} 🔱
←› الفئات : ${mangaData.tags.join(", ")} 🔖
←› التقييم : ${mangaData.rating} ✳
←› عدد القراء : ${mangaData.readCount} ✳
• ┉ • ┉ • ┉ • ┉ • ┉ •
←› القصة : ${mangaData.description} 📖
• ┉ • ┉ • ┉ • ┉ • ┉ •
←› لقراءة الرواية : الرجاء الرد على الرساله بكلمة "قراءة"`;

                const imagePath = path.join(process.cwd(), 'cache', `${mangaData.id}.jpg`);

                // تحميل الصورة
                const imageResponse = await axios.get(mangaData.cover, { responseType: 'arraybuffer' });
                fs.writeFileSync(imagePath, imageResponse.data);

                const stream = fs.createReadStream(imagePath);
                api.sendMessage(
                    {
                        body: msg,
                        attachment: stream,
                    },
                    event.threadID,
                    (error, message) => {
                        global.client.handler.reply.set(message.messageID, {
                            author: event.senderID,
                            type: "pick",
                            name: "روايات", // إضافة الاسم هنا
                            unsend: true,
                            result: mangaData,
                        });
                    }
                );
            } catch (error) {
                console.error("Error occurred while fetching anime details:", error);
                return api.sendMessage("❌︙حدث خطأ أثناء جلب تفاصيل الروايات. الرجاء المحاولة مرة أخرى في وقت لاحق.", event.threadID);
            }
        }

        if (reply.type === "pick" && messageBody === "قراءة") {
            try {
                const res = await axios.get(`https://api-issam-jn6f.onrender.com/wattpad/infoid/${reply.result.id}`);
                const resData = res.data.parts;
                const numParts = resData.length;
                const msg = `⋆˚ ⬷ تحتوي هذه الرواية على ${numParts} رد برقم الفصل لبدك تقرأه ⋆˚ ⬷`;

                api.sendMessage(msg, event.threadID, (error, message) => {
                    global.client.handler.reply.set(message.messageID, {
                        author: event.senderID,
                        name: "روايات", // إضافة الاسم هنا
                        unsend: true,
                        type: "ReadChapt",
                        result: reply.result,
                    });
                });
            } catch (error) {
                console.error(error);
            }
        }

        if (reply.type === "ReadChapt") {
            if (isNaN(messageBody)) return api.sendMessage("رد برقم يااا", event.threadID);
            let num = parseInt(messageBody);
            try {
                const res = await axios.get(`https://api-issam-jn6f.onrender.com/wattpad/infoid/${reply.result.id}`);
                const resData = res.data.parts;
                let nomk = num - 1;

                const getStory = async (id) => {
                    try {
                        const response = await axios.get(`https://api-issam-jn6f.onrender.com/wattpad/id/${id}`);
                        return response.data.text;
                    } catch (error) {
                        console.error('An error occurred while scraping the content:', error);
                    }
                };

                let text = await getStory(resData[nomk].id);
                const wordPattern = /(?:\w+)/g; // Adjust this regex based on your requirements
                text = text.replace(wordPattern, function (match) {
                    return match[0] + '*'.repeat(match.length - 1) + match.slice(-1);
                });

                const parts = [];
                let currentPart = '';
                const words = text.split(' ');

                for (const word of words) {
                    if ((currentPart + ' ' + word).length <= 2000) {
                        currentPart += (currentPart ? ' ' : '') + word;
                    } else {
                        parts.push(currentPart);
                        currentPart = word;
                    }
                }
                if (currentPart) {
                    parts.push(currentPart);
                }

                for (const part of parts) {
                    api.sendMessage(part, event.threadID);
                    await new Promise(resolve => setTimeout(resolve, 8000)); // Add a delay
                }
            } catch (error) {
                console.error(error);
            }
        }
    },
};
