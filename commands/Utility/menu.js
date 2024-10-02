import axios from 'axios';
import request from 'request';

class MenuCommand {
  constructor() {
    this.name = "قائمة";
    this.author = "Arjhil Dacayanan";
    this.cooldowns = 10;
    this.description = "عرض جميع اوامر البوت!";
    this.role = "member";
    this.aliases = ["menu"];
    this.commands = global.client.commands;
  }

  roleText = (role) => ({ member: "الجميع", Admin: "الآدمنية", owner: "المطور" }[role] || "غير معروف");

  aliasesText = (aliases) => (Array.isArray(aliases) && aliases.length > 0 && !aliases.includes("") ? aliases.join(", ") : "None");

  async execute({ event, api }) {
    const commandList = Array.from(this.commands.values());
    const totalCommands = commandList.length;
    const commandsPerPage = 100;

    let msg = `╔═══════════╗\n
    𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐊𝐀𝐆𝐔𝐘𝐀\n╚═══════════╝\n\n`;
    msg += `╭─『 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓 』\n`;

    commandList.forEach((command, index) => {
      if (index % commandsPerPage === 0 && index > 0) {
        msg += `◊────────────────◊\n`;
      }
      msg += `${command.name.padStart(30, ' ')}\n`;
    });

    msg += `\n◊────────────────◊\n`;
    msg += `إجمالي الأوامر : ${totalCommands}`;
    msg += `\n\nقائمة ( إسم الأمر ) من أجل مزيد من التفاصيل.`;

    // Share contact instead of sending GIF
    api.shareContact(msg, api.getCurrentUserID(), event.threadID);
  }

  async onReply({ reply, event, api }) {
    if (reply.author !== event.senderID) return;

    const commandName = event.body.toLowerCase();
    const getCommand = reply.commands.find(cmd => cmd.name.toLowerCase() === commandName);

    if (!getCommand) {
      return api.sendMessage("❌ | إسم غير موجود جرب واحد متوفر", event.threadID, event.messageID);
    }

    const replyMsg = `
╭─『 ${getCommand.name.toUpperCase()} 』
│✧الإسم: ${getCommand.name}
│✧المؤلف: ${getCommand.author}
│✧التبريد: ${getCommand.cooldowns}s
│✧الوصف: ${getCommand.description}
│✧أسماء أخرى: ${this.aliasesText(getCommand.aliases)}
╰───────────◊
`;

    // Share contact for the reply
    api.shareContact(replyMsg, api.getCurrentUserID(), event.threadID);
  }
}

export default new MenuCommand();
