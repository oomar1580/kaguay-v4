import axios from "axios";
import cheerio from "cheerio";

class UidCommand {
  name = "المعرف";
  author = "arjhil";
  cooldowns = 5;
  description = "قم بالحصول على معرف الأشخاص";
  role = "member";
  aliases = [];
  regExCheckURL = /https:\/\/www\.facebook\.com\/[a-zA-Z0-9\.]+/;

  async findUid(link) {
    try {
      const response = await axios.post(
        'https://seomagnifier.com/fbid',
        new URLSearchParams({
          'facebook': '1',
          'sitelink': link
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'PHPSESSID=0d8feddd151431cf35ccb0522b056dc6'
          }
        }
      );
      const id = response.data;
      if (isNaN(id)) {
        const html = await axios.get(link);
        const $ = cheerio.load(html.data);
        const el = $('meta[property="al:android:url"]').attr('content');
        if (!el) throw new Error('UID not found');
        const number = el.split('/').pop();
        return number;
      }
      return id;
    } catch (error) {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }

  async execute({ text, reply, event, api }) {
    let id;

    try {
      if (Object.keys(event.mentions).length === 0) {
        if (event.messageReply) {
          id = event.messageReply.senderID;
        } else {
          id = event.senderID;
        }
        return api.shareContact(id, id, event.threadID);
      } else {
        for (const mentionID in event.mentions) {
          api.shareContact(mentionID, mentionID, event.threadID);
        }
      }

      if (text[0] && this.regExCheckURL.test(text[0])) {
        for (const link of text) {
          try {
            const uid = await this.findUid(link);
            await api.sendMessage(`${link}: ${uid}`, event.threadID);
          } catch (error) {
            await api.sendMessage(`Error fetching UID for ${link}`, event.threadID);
          }
        }
      }
    } catch (error) {
      console.error("Error in executing UID command: ", error);
      return reply("An error occurred while executing the command.");
    }
  }
}

export default new UidCommand();