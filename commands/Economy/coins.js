export default {
  name: "coins",
  author: "Arjhil Dacayanan",
  cooldowns: 5,
  description: "Manage coins in the account!",
  role: "member",
  aliases: ["money", "economy"],
  async execute({ api, event, Economy, args }) {
    try {
      const [action, amount] = args;

      if (["add", "remove"].includes(action) && !global.client.config.ADMIN_IDS.includes(event.senderID)) {
        return api.sendMessage("You don't have the permission to use this command", event.threadID);
      }

      const actions = {
        add: Economy.increase,
        remove: Economy.decrease,
        pay: Economy.pay,
        default: async () => {
          const balance = await Economy.getBalance(event.senderID);
          return api.sendMessage(`Your current coins balance is: ${balance.data}\n\n${global.client.config.ADMIN_IDS.includes(event.senderID) ? `[Because you are an admin, you will see this message]\n!coins add <amount> <@tag> to add coins for the user\n!coins remove <amount> <@tag> to deduct coins from the user` : ""}`, event.threadID);
        },
      };

      const actionFunction = actions[action] || actions["default"];
      const result = await actionFunction(parseInt(amount), event?.messageReply?.senderID || Object.keys(event.mentions)[0]);

      return api.sendMessage(result.data, event.threadID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred, please try again later!", event.threadID);
    }
  },
};
