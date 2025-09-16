cmd install test2.js cmd install test2.js const axios = require("axios"); const baseApiUrl = async () => { const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"); return base.data.mahmud }; module.exports = { config: { name: "نوكس", version: "1.7", author: "MahMUD", countDown: 5, role: 0, category: "ai", guide: { en: "", }, }, onStart: async function ({ api, args, event }) { const apiUrl = `${await baseApiUrl()}/api/gemini`; const prompt = args.join(" "); if (!prompt) { return api.sendMessage( "

      نـــوكس AI 🌟



• ذكاء اصطناعي متطور ، يملك خاصية البحث في الغوغل عن طريق المصادر الموثوقة ، اي ان معلوماته صحيحة يمكنك طرح اسئلتك و سيقوم بالبحث عن إجابة و صياغة إجابة مثالية في ثواني .

      

      🌍 خطوات البحث :

      1. بحث في غوغل

      2. تصفح النتائج

      3. تصفح صفحات الموقع

      4. استخراج معلومات من الصور

      ", event.threadID, event.messageID ); } let requestBody = { prompt }; if (event.type === "message_reply" && event.messageReply.attachments.length > 0) { const attachment = event.messageReply.attachments[0]; if (attachment.type === "photo") { requestBody.imageUrl = attachment.url; } } try { const response = await axios.post(apiUrl, requestBody, { headers: { "Content-Type": "application/json", "author": module.exports.config.author } }); if (response.data.error) { return api.sendMessage(response.data.error, event.threadID, event.messageID); } const replyText = response.data.response || "No response received."; api.sendMessage({ body: replyText }, event.threadID, (error, info) => { if (!error) { global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, type: "reply", messageID: info.messageID, author: event.senderID, link: replyText, }); } }, event.messageID); } catch (error) { console.error("Error:", error); api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID); } }, onReply: async function ({ api, args, event, Reply }) { if (Reply.author !== event.senderID) return; const apiUrl = `${await baseApiUrl()}/api/gemini`; const prompt = args.join(" "); if (!prompt) return; try { const response = await axios.post(apiUrl, { prompt }, { headers: { "Content-Type": "application/json", "author": module.exports.config.author } }); if (response.data.error) { return api.sendMessage(response.data.error, event.threadID, event.messageID); } const replyText = response.data.response || "No response received."; api.sendMessage({ body: replyText }, event.threadID, (error, info) => { if (!error) { global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, type: "reply", messageID: info.messageID, author: event.senderID, link: replyText, }); } }, event.messageID); } catch (error) { console.error("Error:", error); api.sendMessage("error janu, Please try again later 🥹", event.threadID, event.messageID); } } };
