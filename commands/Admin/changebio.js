export default {
    name: "changebio",
    author: "Arjhil Dacayanan",
    role: "owner",
    cooldowns: 10,
    description: "Change bot's biography",
    async execute({ api, args }) {
      try {
        var content = args.join(" ") || "";
        await api.changeBio(content);
        return kaguya.reply(`Bot's biography has been changed to: ${content}`)
      } catch (err) {
        console.error(err);
      }
    },
};
