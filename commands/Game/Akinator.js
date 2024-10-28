import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اكيناتور",
  author: "عصام",
  role: "member",
  aliases: ["Akinator"],
  description: "لعبة أكيناتور التي تفكر في الشخصيات.",
  
  async execute({ api, event }) {
    const url = `https://ar.akinator.com/game`;
    const formData = new URLSearchParams();
    formData.append('sid', '1');
    formData.append('cm', 'false');

    try {
      const { data: text } = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const questionMatch = text.match(/<p class="question-text" id="question-label">(.+)<\/p>/);
      const sessionMatch = text.match(/session: '(.+)'/);
      const signatureMatch = text.match(/signature: '(.+)'/);

      if (questionMatch && sessionMatch && signatureMatch) {
        const question = questionMatch[1];
        const session = sessionMatch[1];
        const signature = signatureMatch[1];

        api.sendMessage(`${question} 🧚🏻‍♀`, event.threadID, (error, info) => {
          if (error) return console.error("Error:", error);

          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            name: "اكيناتور",
            unsend: false, // لا تحذف الرسالة مباشرة
            session,
            signature,
            step: "0",
            progression: "0.00000",
            attempts: 1
          });
        });
      } else {
        api.setMessageReaction('😴', event.messageID, (err) => {}, true);
      }
    } catch (error) {
      console.error("Error during Akinator request:", error);
      api.sendMessage("⚠️ | حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.author !== event.senderID) {
      return api.sendMessage("❌ هذه اللعبة ليست لك! انتظر حتى ينتهي الدور", event.threadID);
    }

    let answer;
    switch (event.body) {
      case "نعم": answer = "0"; break;
      case "لا": answer = "1"; break;
      case "لا اعلم": answer = "2"; break;
      case "ربما": answer = "3"; break;
      case "الظاهر لا": answer = "4"; break;
      default:
        return api.sendMessage('♡◄∘ الرجـاء الـرد بأحـد الافـعـال الـتـالـيـة : ∘►♡\n\n❖ نعم\n❖ لا\n❖ لا اعلم\n❖ ربما\n❖ الظاهر لا\n♡◄∘ لـعـبـة أكـيـنـاتـور∘►♡', event.threadID);
    }

    const { session, signature, step, progression, attempts } = reply;

    try {
      const res = await axios.post(
        'https://ar.akinator.com/answer',
        new URLSearchParams({
          'step': step,
          'progression': progression,
          'sid': 'NaN', 
          'cm': 'false',
          'answer': answer,
          'session': session,
          'signature': signature
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = res.data;

      if (data.photo) {
        const name = data.name_proposition;
        const des = data.description_proposition;

        const imagePath = path.join(process.cwd(), 'cache', `akinator_${event.senderID}.jpg`);
        const imgResponse = await axios.get(data.photo, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);
        imgResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        api.setMessageReaction("💫", event.messageID, (err) => {}, true);
        api.sendMessage({
          body: `🧞 | أنـا أفـكـر فـي 🤔 : ${name} \n📝 | مـعـلـومـات حـول الـشخـصـيـة : ${des} \n🚨 | عـدد الـمـحـاولـات : ${attempts} `,
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
          fs.unlinkSync(imagePath);
        });
      } else {
        const question = data.question;
        
        api.sendMessage(`${question} 🧚🏻`, event.threadID, (error, info) => {
          if (error) return console.error("Error:", error);

          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            name: "اكيناتور",
            unsend: true, // حذف الرسالة فقط في الردود الصحيحة
            session,
            signature,
            step: data.step,
            attempts: attempts + 1,
            progression: data.progression
          });
        });
      }
    } catch (error) {
      console.error("Error during Akinator answer:", error);
      api.setMessageReaction("🥺", event.messageID, (err) => {}, true);
    }
  }
};
