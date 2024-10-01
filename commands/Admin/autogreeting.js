import axios from "axios";
import fs from "fs";
import path from "path";

export default {
    name: "رسائل-تلقائية",
    author: "YourName",
    role: "member",
    description: "يرسل رسالة تحفيزية مع صورة كل ساعة.",

    execute(api, event) {
        const { threadID } = event;
        let isActive = false;

        // روابط الصور
        const imagesURLs = [
              "https://i.imgur.com/STbzVzE.jpg",
            "https://i.imgur.com/1BtL3xt.jpg",
            "https://i.imgur.com/gtn6yGM.jpg",
            "https://i.imgur.com/KirOPqX.jpg",
            "https://i.imgur.com/DnvyJKf.jpg",
            "https://i.imgur.com/5JaWn3U.jpg",
            "https://i.imgur.com/RlTHVIO.jpg",
            "https://i.imgur.com/u8CNofc.jpg",
            "https://i.imgur.com/vNrHyAR.jpg",
            "https://i.imgur.com/P0ojenL.jpg",
            "https://i.imgur.com/p7LUVyZ.jpg",
            "https://i.imgur.com/FE2ig0h.jpg",
            "https://i.imgur.com/z0JI2G4.jpg",
            "https://i.imgur.com/CDLFnDs.jpg",
            "https://i.imgur.com/qQU8cRV.jpg",
            "https://i.imgur.com/uTj47XE.jpg",
            "https://i.imgur.com/Hb4Dg26.jpg",
            "https://i.imgur.com/oJW3DF7.jpg",
            "https://i.imgur.com/zXOth4y.jpg",
            "https://i.imgur.com/B54ekJA.jpg",
            "https://i.imgur.com/V7nQRZB.jpg",
            "https://i.imgur.com/WeyzqC0.jpg",
            "https://i.imgur.com/wJaNjZ8.jpg",
            "https://i.imgur.com/sAcK8Iu.jpg",
            "https://i.imgur.com/Zf09ask.jpg",
            "https://i.imgur.com/8fg6BZq.jpg",
            "https://i.imgur.com/kxcwC1t.jpg",
            "https://i.imgur.com/BEgICzb.jpg",
            "https://i.imgur.com/JXqjOwy.jpg",
            "https://i.imgur.com/B4gGSP2.jpg",
            "https://i.imgur.com/eYT9c0E.jpg",
            "https://i.imgur.com/vh5eqJe.jpg",
            "https://i.imgur.com/EWVvpPD.jpg",
            "https://i.imgur.com/pkFgWKS.jpg",
            "https://i.imgur.com/TNHqo4b.jpg",
            "https://i.imgur.com/P89pj57.jpg",
            "https://i.imgur.com/HIOGDst.jpg",
            "https://i.imgur.com/lNDkhzD.jpg",
            "https://i.imgur.com/r38eirX.jpg",
            "https://i.imgur.com/ldwp4Rh.jpg",
            "https://i.imgur.com/ZvfZ6WR.jpg",
            "https://i.imgur.com/ENJNsEg.jpg",
            "https://i.imgur.com/Os4A7hs.jpg",
            "https://i.imgur.com/p99aSKf.jpg",
            "https://i.imgur.com/CfbuSUT.jpg",
            "https://i.imgur.com/rZnX99a.jpg",
            "https://i.imgur.com/PS1pR8V.jpg",
            "https://i.imgur.com/WXimaBD.jpg",
            "https://i.imgur.com/HoiDXY7.jpg",
            "https://i.imgur.com/r2egHOG.jpg",
            "https://i.imgur.com/lQ8PaYV.jpg",
            "https://i.imgur.com/wi60ix3.jpg",
            "https://i.imgur.com/SSv6Mcf.jpg",
            "https://i.imgur.com/gznQchH.jpg",
            "https://i.imgur.com/SK2Io59.jpg",
            "https://i.imgur.com/3pZeaLM.jpg",
            "https://i.imgur.com/4oV5Egc.jpg",
            "https://i.imgur.com/zvuYRFj.jpg",
            "https://i.imgur.com/Bjz05vD.jpg",
            "https://i.imgur.com/szehA87.jpg",
            "https://i.imgur.com/hPRBM08.jpg",
            "https://i.imgur.com/A7JSoBG.jpg",
            "https://i.imgur.com/BT9ojDC.jpg",
            "https://i.imgur.com/NBa804M.jpg",
            "https://i.imgur.com/kG8EPp7.jpg",
            "https://i.imgur.com/uDEzIuI.jpg",
            "https://i.imgur.com/KFOpmtg.jpg",
            "https://i.imgur.com/Pk0Vf47.jpg",
            "https://i.imgur.com/ebOYYBy.jpg",
            "https://i.imgur.com/8EXyLsz.jpg"
        ];

        // الرسائل
        const messages = [
            `وليس كل ماصرفه الله عنك شرٌ لك لعلك أنت الخير الذي لا يستحقونه 💙💙.
            𝑨𝒏𝒅 𝒏𝒐𝒕 𝒆𝒗𝒆𝒓𝒚𝒕𝒉𝒊𝒏𝒈 𝒕𝒉𝒂𝒕 𝑮𝒐𝒅 𝒔𝒑𝒆𝒏𝒕 𝒇𝒓𝒐𝒎 𝒚𝒐𝒖 𝒊𝒔 𝒆𝒗𝒊𝒍 𝒇𝒐𝒓 𝒚𝒐𝒖, 𝒑𝒆𝒓𝒉𝒂𝒑𝒔 𝒚𝒐𝒖 𝒂𝒓𝒆 𝒕𝒉𝒆 𝒈𝒐𝒐𝒅 𝒕𝒉𝒂𝒕 𝒕𝒉𝒆𝒚 𝒅𝒐 𝒏𝒐𝒕 𝒅𝒆𝒔𝒆𝒓𝒗𝒆.💙💙`,
            `لا شي يبقـــى للأبد حتى الشمس سـتگسر القانون يوماً وتشرق غرباً لتعلن النهاية🌷✨
𝑵𝑶𝑻𝑯𝑰𝑵𝑮 𝑹𝑬𝑴𝑨𝑰𝑵𝑺 𝑭𝑶𝑹𝑬𝑽𝑬𝑹, 𝑼𝑵𝑻𝑰𝑳 𝑻𝑯𝑬 𝑺𝑼𝑵 𝑾𝑰𝑳𝑳 𝑩𝑹𝑬𝑨𝑲 🌷✨`,
            `-𝑫𝒐𝒏'𝒕 𝒕𝒓𝒖𝒔𝒕 𝒔𝒐𝒎𝒆𝒐𝒏𝒆 𝒋𝒖𝒔𝒕 𝒃𝒆𝒄𝒂𝒖𝒔𝒆 𝒚𝒐𝒖 𝒍𝒊𝒌𝒆 𝒕𝒂𝒍𝒌𝒊𝒏𝒈𝑾𝒊𝒕𝒉 𝒉𝒊𝒎, 𝒍𝒊𝒇𝒆 𝒉𝒂𝒔 𝒃𝒆𝒄𝒐𝒎𝒆 𝒂𝒔𝒑𝒆𝒄𝒕𝒔 𝒕𝒉𝒂𝒕 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒄𝒐𝒏𝒕𝒆𝒎𝒑𝒍𝒂𝒕𝒆 𝒘𝒆𝒍𝒍. 🦋✨
-لاتثق بشخص لمجرد اعجبك الحديث
معة فالحياة أصبحت مظاهر تاملوها جيدا .🦋✨`,
            `‏النظرات قادرة على اختصار حديث 
من سبعين ألف كلمة.🤎
“𝑳𝒐𝒐𝒌𝒔 𝒄𝒂𝒏 𝒔𝒉𝒐𝒓𝒕𝒆𝒏 𝒂 𝒄𝒐𝒏𝒗𝒆𝒓𝒔𝒂𝒕𝒊𝒐𝒏 
𝑺𝒆𝒗𝒆𝒏𝒕𝒚 𝒕𝒉𝒐𝒖𝒔𝒂𝒏𝒅 𝒘𝒐𝒓𝒅𝒔🤎`,
            `𝑰 𝒈𝒂𝒗𝒆 𝒎𝒚 𝒇𝒆𝒆𝒍𝒊𝒏𝒈𝒔 𝒂𝒏𝒅 𝒆𝒏𝒆𝒓𝒈𝒚 𝒐𝒏𝒄𝒆, 𝒂𝒏𝒅 𝒉𝒆𝒓𝒆 𝑰 𝒇𝒆𝒍𝒍 𝒘𝒊𝒕𝒉 𝒎𝒚 𝒘𝒉𝒐𝒍𝒆 𝒘𝒆𝒊𝒈𝒉𝒕 𝒂𝒏𝒅 𝒄𝒐𝒖𝒍𝒅 𝒏𝒐𝒕 𝒈𝒆𝒕 𝒖𝒑. 🖤
لقد وهبتُ مشاعري و طاقتي مرةً واحدة وها أنا سَقطت بثقلي كله و لم أستطيع النهوض`,
            `لا يـهـمـني إن غادرنـي الـجـميـع ، فـمـنذ الـبـدايـة ارسـم مـسـتـقبلا لايـوجـد فيه احد..🤍🪐

𝑱𝒆 𝒎𝒆 𝒇𝒊𝒄𝒉𝒆 𝒒𝒖𝒆 𝒕𝒐𝒖𝒕 𝒍𝒆 𝒎𝒐𝒏𝒅𝒆 𝒎𝒆 𝒕𝒓𝒂𝒉𝒊𝒔𝒔𝒆, 𝒅𝒆𝒑𝒖𝒊𝒔 𝒍𝒆 𝒅é𝒃𝒖𝒕 𝒋𝒆 𝒅𝒆𝒔𝒔𝒊𝒏𝒆 𝒖𝒏 𝒂𝒗𝒆𝒏𝒊𝒓 𝒐ù 𝒊𝒍 𝒏'𝒚 𝒂 𝒑𝒆𝒓𝒔𝒐𝒏𝒏𝒆..🤍🪐💗🍯`,
            `𝑯𝒐𝒘𝒆𝒗𝒆𝒓 𝒅𝒊𝒇𝒇𝒊𝒄𝒖𝒍𝒕 𝒍𝒊𝒇𝒆 𝒎𝒂𝒚 𝒔𝒆𝒆𝒎, 𝒕𝒉𝒆𝒓𝒆 𝒊𝒔 𝒂𝒍𝒘𝒂𝒚𝒔 𝒔𝒐𝒎𝒆𝒕𝒉𝒊𝒏𝒈 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒅𝒐 𝒂𝒏𝒅 𝒔𝒖𝒄𝒄𝒆𝒆𝒅 𝒂𝒕🩵✨
‏مهما بدت الحياة صعبه، يوجد دائمًا شيءٌ يمكنك النجاح فيه.🩵✨`,
            `𝘾𝙧𝙮𝙞𝙣𝙜 i𝙮s 𝙣𝙤𝙩 𝙖 𝙨𝙞𝙜𝙣 𝙤𝙛 𝙬𝙚𝙖𝙠𝙣𝙚𝙨𝙨. 𝙎𝙤𝙢𝙚𝙩𝙞𝙢𝙚𝙨 𝙖 𝙥𝙚𝙧𝙨𝙤𝙣 𝙘𝙧𝙞𝙚𝙨 𝙗𝙚𝙘𝙖𝙪𝙨𝙚 𝙝𝙚 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙨𝙩𝙧𝙤𝙣𝙜 𝙛𝙤𝙧 𝙖 𝙡𝙤𝙣𝙜 𝙩𝙞𝙢𝙚. 🖤🥀
ليس البكاء دليل على الضعف، أحيانًا يبكي الشخص لأنه كان قوي لفترة طويلة.🖤🥀`,
            `‏"أعتقد أن بعض الناس قد قضوا الوقت معي لأنهم فقط كانوا وحيدين".🖤🥀
“𝙄 𝙩𝙝𝙞𝙣𝙠 𝙨𝙤𝙢𝙚 𝙥𝙚𝙤𝙥𝙡𝙚 𝙨𝙥𝙚𝙣𝙩 𝙩𝙞𝙢𝙚 𝙬𝙞𝙩𝙝 𝙢𝙚 𝙗𝙚𝙘𝙖𝙪𝙨𝙚 𝙩𝙝𝙚𝙮 𝙬𝙚𝙧𝙚 𝙟𝙪𝙨𝙩 𝙡𝙤𝙣𝙚𝙡𝙮.”🖤🥀`,
            `أنا ذلك الشخص الذي يرشد التائهين ولا يعرف كيف يغادر المتاهة.🤎🌪

𝒊 𝒂𝒎 𝒕𝒉𝒆 𝒑𝒆𝒓𝒔𝒐𝒏 𝒘𝒉𝒐 𝒈𝒖𝒊𝒅𝒆𝒔 𝒕𝒉𝒆 𝒘𝒂𝒏𝒅𝒆𝒓𝒊𝒏𝒈 𝒂𝒏𝒅 𝒅𝒐 𝒏𝒐𝒕 𝒌𝒏𝒐𝒘 𝒉𝒐𝒘 𝒕𝒐 𝒍𝒆𝒂𝒗𝒆 𝒕𝒉𝒆 𝒎𝒂𝒛𝒆.🤎🌪`,
            `أن يَكون لك صَديق يَراك وكأنّك الخير في
هذهِ الأرض، شُعور لا يُمكنك أن تَضعه في
كلماتٍ مُناسِبة.💖"
𝙏𝙤 𝙝𝙖𝙫𝙚 𝙖 𝙛𝙧𝙞𝙚𝙣𝙙 𝙬𝙝𝙤 𝙨𝙚𝙚𝙨 𝙮𝙤𝙪 𝙖𝙨 𝙩𝙝𝙚 𝙗𝙚𝙨𝙩 𝙞𝙣 𝙮𝙤𝙪
𝙏𝙝𝙞𝙨 𝙚𝙖𝙧𝙩𝙝, 𝙖 𝙛𝙚𝙚𝙡𝙞𝙣𝙜 𝙮𝙤𝙪 𝙘𝙖𝙣'𝙩 𝙥𝙪𝙩 𝙞𝙣
𝙎𝙪𝙞𝙩𝙖𝙗𝙡𝙚 𝙬𝙤𝙧𝙙𝙨.💖`,
            `-الغائبون بلا عذر كالحاضرين بلا فائدة ، كلاهما يشغل حيزاً ﻻ يستحقه.💨
- 𝑇ℎ𝑜𝑠𝑒 𝑤ℎ𝑜 𝑎𝑟𝑒 𝑎𝑏𝑠𝑒𝑛𝑡 𝑤𝑖𝑡ℎ𝑜𝑢𝑡 𝑒𝑥𝑐𝑢𝑠𝑒 𝑎𝑟𝑒 𝑙𝑖𝑘𝑒 𝑡ℎ𝑜𝑠𝑒 𝑤ℎ𝑜 𝑎𝑟𝑒 𝑝𝑟𝑒𝑠𝑒𝑛𝑡 𝑤𝑖𝑡ℎ𝑜𝑢𝑡 𝑏𝑒𝑛𝑒𝑓𝑖𝑡. 𝐵𝑜𝑡ℎ 𝑜𝑓 𝑡ℎ𝑒𝑚 𝑜𝑐𝑐𝑢𝑝𝑦 𝑠𝑝𝑎𝑐𝑒 𝑡ℎ𝑎𝑡 𝑡ℎ𝑒𝑦 𝑑𝑜 𝑛𝑜𝑡 𝑑𝑒𝑠𝑒𝑟𝑣𝑒.💨`,
        ];

        // دالة لتحميل الصور إلى مجلد cache
        const downloadImage = async (url, filepath) => {
            const response = await axios({
                url,
                responseType: 'stream'
            });
            return new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(filepath);
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        };

        // دالة لإرسال الرسائل والصور بشكل دوري
        const motivation = async () => {
            try {
                const randomIndex = Math.floor(Math.random() * messages.length);
                const message = messages[randomIndex];
                const imageUrl = imagesURLs[randomIndex];
                const imageName = `image${randomIndex + 1}.jpg`;
                const imagePath = path.join(process.cwd(), 'cache', imageName);

                // تحميل الصورة إلى مجلد cache
                if (!fs.existsSync(imagePath)) {
                    await downloadImage(imageUrl, imagePath);
                }

                const attachment = fs.createReadStream(imagePath);

                const threads = await api.getThreadList(25, null, ['INBOX']);
                for (const thread of threads) {
                    if (thread.isGroup && thread.name !== thread.threadID) {
                        await api.sendMessage({ body: message, attachment }, thread.threadID);
                    }
                }
            } catch (error) {
                console.error("Error sending motivation message: ", error);
            }
        };

        // بدء إرسال الرسائل الآلية
        const startAutoMessage = () => {
            isActive = true;
            setInterval(() => {
                if (isActive) {
                    motivation();
                }
            }, 3600000); // كل ساعة
            api.sendMessage("┌─[ AUTOMESSAGE ]──[ # ]\n└──► اارسائل التلقائية تم تشغيلها", threadID);
        };

        // إيقاف إرسال الرسائل الآلية
        const stopAutoMessage = () => {
            isActive = false;
            api.sendMessage("┌─[ AUTOMESSAGE ]──[ # ]\n└──► الرسائل التلقائية تم إيقافها !", threadID);
        };

        // التحقق من أوامر التشغيل أو الإيقاف
        if (event.body.toLowerCase() === 'رسائل-تلقائية تشغيل') {
            startAutoMessage();
        } else if (event.body.toLowerCase() === 'رسائل-تلقائية إيقاف') {
            stopAutoMessage();
        }
    }
};
