import axios from "axios";

export default {
  name: "رابط",
  author: "Arjhil Dacayanan",
  cooldowns: 10,
  description: "رفع الصوى الى موقع gur",
  role: "member",
  aliases: ["imgur"],

  async execute({ api, event }) {
    const clientId = "fc9369e9aea767c";
    const client = axios.create({
      baseURL: "https://api.imgur.com/3/",
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
    });

    const uploadImage = async (url) => {
      return (
        await client.post("image", {
          image: url,
        })
      ).data.data.link;
    };

    const array = [];

    if (event.type !== "message_reply" || event.messageReply.attachments.length === 0) {
      return api.sendMessage("⚠️ | رد على صورة", event.threadID);
    }

    for (const { url } of event.messageReply.attachments) {
      try {
        const res = await uploadImage(url);
        array.push(res);
      } catch (err) {
        console.log(err);
      }
    }

    return api.sendMessage(`» تم رفع ${array.length} صورة بنجاح\nفشل رفع : ${array.length - event.messageReply.attachments.length}\n» رابط.الصورة:\n${array.join("\n")}`, event.threadID);
  },
};
