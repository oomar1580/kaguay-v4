import axios from "axios";

const nm = ["⓪", "⓵", "⓶", "⓷", "⓸", "⓹", "⓺", "⓻", "⓼", "⓽"];
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function decodeMIME(encodedStr) {
  if (encodedStr.includes('=?UTF-8?B?')) {
    return encodedStr
      .split(' ')
      .map(part => {
        const matches = part.match(/\?UTF-8\?B\?(.+)\?=/);
        if (matches) {
          return Buffer.from(matches[1], 'base64').toString('utf8');
        }
        return part;
      })
      .join(' ');
  }

  return encodedStr;
}

export default {
  name: "بريد",
  author: "YourName",
  role: "admin",
  description: "إدارة البريد الإلكتروني وإنشاء بريد جديد وصندوق بريد",
  version: "1.0",
  aliases: ["tempmail", "mail"],
  execute: async ({ api, args, event }) => {
    const m = args[0];
    if (!m) {
      return api.sendMessage(
        "اكتب بريد جديد لإنشاء بريد جديد او اذا كنت تريد بريد جديد بأسمك، اكتب بريد جديد اسمك وبعض الأرقام @ المضيف. سأذكر البعض منهم في الأسفل: \n \n 1. t-mail.tech\n2. fbimg.click\n3. fbrankupgif.click\n4. lianeai.click\n5. hazeyy.click\n6. tangina.click\n\n ملاحظة: وقت استلام الرسائل يستغرق وقت.",
        event.threadID
      );
    }

    switch (m) {
      case "جديد":
      case "-ج": {
        const ema = args.slice(1).join(" ");

        if (
          ema &&
          emailRegex.test(ema) &&
          (ema.endsWith("@t-mail.tech") ||
            ema.endsWith("@fbimg.click") ||
            ema.endsWith("@fbrankupgif.click") ||
            ema.endsWith("@lianeai.click") ||
            ema.endsWith("@tangina.click") ||
            ema.endsWith("@hazeyy.click"))
        ) {
          try {
            const tt = await axios.get(`https://maill-issam.onrender.com/api/create_email?email=${ema}`);

            if (tt.data.status === false) {
              return api.sendMessage("مجرد خطأ أو تحقق من كتابة البريد الإلكتروني بشكل صحيح.", event.threadID);
            }

            const mx = tt.data.email;
            return api.sendMessage(`تفضل بريدك الجديد 🚮🚮\n ${mx}`, event.threadID);
          } catch (error) {
            return api.sendMessage("حدث خطأ أثناء إنشاء البريد الإلكتروني.", event.threadID);
          }
        } else {
          try {
            const res = await axios.get("https://maill-issam.onrender.com/api/generate_email");
            const email = res.data.email;
            return api.sendMessage(`تفضل بريدك الجديد 🙂🚮\n ${email}`, event.threadID);
          } catch (error) {
            return api.sendMessage("حدث خطأ أثناء توليد البريد الإلكتروني.", event.threadID);
          }
        }
      }

      case "صندوق":
      case "-ص": {
        const arg = args.slice(1).join(" ");
        if (!arg) {
          return api.sendMessage("ادخل البريد الإلكتروني المطلوب.", event.threadID);
        }
        if (!arg.match(emailRegex)) {
          return api.sendMessage("البريد الإلكتروني المدخل غير صحيح.", event.threadID);
        }

        try {
          const res = await axios.get(`https://maill-issam.onrender.com/api/inbox?email=${arg}`);
          if (res.data.status === false) {
            return api.sendMessage("حدث خطأ في جلب الرسائل.", event.threadID);
          }

          const results = res.data.data;
          if (results.length === 0) {
            return api.sendMessage("لا توجد رسائل حالياً 🙂🚮", event.threadID);
          }

          let msg = "";
          results.forEach((r, i) => {
            const { subject, from, date } = r;
            const index = (i + 1).toString().split('').map(num => nm[parseInt(num)]).reverse().join('');
            msg += `-------------------\n${index}\n الرسالة: ${decodeMIME(subject)} 🗳\nمن: ${from} 📬\n التاريخ: ${date} 📆📌\n-------------------\n`;
          });

          return api.sendMessage(msg, event.threadID);
        } catch (error) {
          return api.sendMessage("حدث خطأ أثناء جلب الرسائل.", event.threadID);
        }
      }
    }
  },
};
