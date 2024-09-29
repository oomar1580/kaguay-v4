import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

const KievRPSSecAuth = process.env.KievRPSSecAuth || "FACCBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACLmTHuNOGauyQARPk2KxewKUbc5DqnY7MQRwlLtYzU111x9XUyVjGOwZZzAcU7b06KezYFKUxT7uGYK+uO/s2kPySGDwmW8ffnu5HsbJH0L2HsaWcqzPuUg58l9XjDvG1iIn2AWqhXA1DYyJxcGm0h3EFoXXVrVWsnLENKRtcevnroHOwl5//GmPI9AY2TVWeCYNGllx8xqZqApXRGG8LzTvVM0S/nQHJ5KeT+YeQ37/UXM1O1gvzMQj3z59vU6kBkac1MEZPpAPs5vyVmkQqqPCIj1w9/Q4eEq8Cg4fyPs+Z0+iLIESnE4COQ/F4mODB+hP6taocEq84Bj2FizvNmWNzGONOU3flZd15qhDW71uinRHYJppMeUFPOjziIWWVTwvRcjw987E2alzbJMNVPN5EYBM6Vz8GlRl/WpzG33Z3tdlmHB3l/q1/tqy6a2ubbn/3zzSiTOiHaWcqRjueZInJebj1RU0Sv629F3P8iKRCTY3eUjyDrEjx95+WB1x8dMeXMV/yiKXVMooEmLL3ZbhA41OFueGdNWGHFZupdl+zh2Pt2YbI/G7mtvs1LhpZO/wnT1vFbDFLEQCTDh8fBJsAu0RkPzOjSzl0dkaXxw7LJyLP4pmy4GXABrj0J06nIPn3EbZEuPb6hr6MJIJsz16rsaHCtWuijxbnwBHm7YM8CLSUJj1de0i6ysRqCgq0nl3EZ+lGk/+t7BJo+K3+8NJTNmeP6VnUWr0s7uTDu0tZA2TILhTWjLKaf/vrLPTkLgo5OtpW0LbQQhNT5RCvQVlkFCO91mz9alVnAqsy9VdRG20qzR5H18AMNSKVwf4jfFkSrkeI7ZPyl/v0CJQdWyGKHYhnMQ622o4Kug1V9l2NR3oFI4nt82dleUnF/3smW/KUtxnGov2WCgcPSH09hcTrEggmbvuH33ukeESXuZVfE/+mrXLlkxrNbOFnD5cvvzh99tav/wtM16lcw+N2I8vGCyLtEKs0JV7SObXnMwMbfJLppGyhOwVOa0Oi5t+VtvwJHZTtsb1yxP5g0J+K7RcobDzUvYDA04PRkI3dAEhaw+yt+yDrDv4aQoov1bSHMwJSeKtZf8jJIcKVgQ+S1Tji3K11i0VoCd4YE76aXwbKeu8DRKdo3PiXGAJ/Fqnx9DdLdnA0cIaruTrrmgk8A4uab6Qplhs9ywRIVJdYaBYpk8YZd5SCT5kzWNB2Ys1nIizzchoQUTRNpuAYQ+D6z/r1IYxJAynN9e2rggI7WiMO9Kv6FmzoJH/SU5yan6k9P8rFsGQX3n7CuHiSH74qWCflEEPH9aaEGwo9k4UGOz0Cq3EUg8oJ3IoHd3Q9R4D2/+JHjk3+k4iRY6TKrp0+ds6jIx19heA9WSHU90FMqQG4b1SdMfPcr9p0Wbl+yTZqUXwPzEBpRMau/TLmuSSBQky/f88A71HPaJBZzDE/vTTvYWUNh/DPV8MexQA6siCWNjSOzH9F4I/Isw4qdvBcDw=";
const _U = process.env._U || "197sgGZc_TvR2nOGkwbB1zhdP0wy5AMiTqTTfGNMDPs6Os_FCXhfTllfxDFXv9GGLFNEJAk3RmvVZfMyG4qMzsfFiaFbLUJLjPlDMscmQNMwqwC3pZlMJ1M2dhjaLUvEPx_6fidpcNkP3CldXIbtkSQQIVicU2QHqrY_AszyefMpxAxWsfkqYZhPi-5eq8dHuYb_Xe4zQxsJogniVIwgLUnsiB4x_puBO3gafmYXcko8";
export default {
  name: "تخيلي",
  author: "kaguya project",
  cooldowns: 50,
  description: "فم بتوليد ثور بإستخدام الذكاء الإصطناعي dalle",
  role: "member",
  aliases: ["dalle", "تخيل"],
  execute: async ({ api, event, args, Economy }) => {

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;

    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);
    
    const prompt = args.join(" ");
    const senderID = event.senderID;

    try {
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

      const res = await axios.get(`https://apis-dalle-gen.onrender.com/dalle3?auth_cookie_U=${encodeURIComponent(_U)}&auth_cookie_KievRPSSecAuth=${encodeURIComponent(KievRPSSecAuth)}&prompt=${encodeURIComponent(translatedText)}`);
      const data = res.data.results.images;

      if (!data || data.length === 0) {
        api.sendMessage("⚠️ | حدث خطأ أثناء عملية توليد الصورة ", event.threadID, event.messageID);
        return;
      }

      // تحميل صورة واحدة فقط
      const imgResponse = await axios.get(data[0].url, { responseType: 'arraybuffer' });
      const imgPath = path.join(process.cwd(), 'cache', 'image.jpg');
      await fs.outputFile(imgPath, imgResponse.data);
      const imgData = fs.createReadStream(imgPath);

      // استخدام moment-timezone لجلب الوقت والتاريخ
      const now = moment().tz("Africa/Casablanca");
      const timeString = now.format("HH:mm:ss");
      const dateString = now.format("YYYY-MM-DD");
      const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      api.getUserInfo(senderID, async (err, userInfo) => {
        if (err) {
          console.log(err);
          return;
        }
        const userName = userInfo[senderID].name;

        await api.sendMessage({
          attachment: imgData,
          body: `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n࿇ ══━━✥◈✥━━══ ࿇`;
`
        }, event.threadID, event.messageID);
      }); 

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      api.sendMessage("⚠️ | حدث خطأ", event.threadID, event.messageID);
    }
  }
};
