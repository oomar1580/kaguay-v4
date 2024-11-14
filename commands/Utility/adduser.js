import axios from 'axios';

async function getUID(url) {
  if (url.includes("facebook.com") || url.includes("fb.com")) {
    try {
      if (!url.startsWith("https://") && !url.startsWith("http://")) url = "https://" + url;
      const apiUrl = `https://joshweb.click/api/findid?url=${encodeURIComponent(url)}`;

      // Request the user ID from the new API
      const response = await axios.get(apiUrl);
      if (response.data.status) {
        return [response.data.result, null, false];
      } else {
        return [null, null, true];
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return [null, null, true];
    }
  } else {
    return ["Invalid URL", null, true];
  }
}

export default {
  name: "ضفي",
  author: "kaguya project",
  description: "أمر لإضافة عضو إلى المجموعة",
  aliases: ["add","ضيفي"],
  role: "admin",
  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const botID = api.getCurrentUserID();
    const out = msg => api.sendMessage(msg, threadID, messageID);
    const { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
    const participantIDsParsed = participantIDs.map(e => parseInt(e));

    if (!args[0]) return out("⚠️ | الرجاء إدخال رابط البروفايل من أجل إضافة العضو إلى المجموعة.");

    try {
      const [id, , fail] = await getUID(args[0]);
      if (fail && id !== null) return out(id);
      else if (fail && id === null) return out("❗ | لم يتم العثور على معرّف المستخدم.");
      else {
        await addUser(id);
      }
    } catch (e) {
      return out(`${e.name}: ${e.message}.`);
    }

    async function addUser(id) {
      id = parseInt(id);
      if (participantIDsParsed.includes(id)) return out(` ⚠️ | العضو موجود بالفعل في المجموعة.`);
      else {
        const admins = adminIDs.map(e => parseInt(e.id));
        
        try {
          // Fetch the user's name using getUserInfo
          const userInfo = await api.getUserInfo(id);
          const userName = userInfo[id]?.name || "عضو";
          
          await api.addUserToGroup(id, threadID);
          if (approvalMode && !admins.includes(botID)) {
            return out(`✅ | تمت إضافة ${userName} إلى قائمة الموافقة.`);
          } else {
            return out(`✅ | تمت إضافة ${userName} إلى المجموعة.`);
          }
        } catch {
          return out(` 🚫 | لا يمكن إضافة العضو إلى المجموعة.`);
        }
      }
    }
  },
};
