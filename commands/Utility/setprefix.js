import jimp from "jimp";

export default {
  name: "setprefix",
  author: "Arjhil Dacayanan",
  cooldowns: 60,
  description: "Set the group prefix",
  role: "owner",
  aliases: ["prefix"],
  execute: async ({ event, Threads, args }) => {
    if (!event.isGroup) {
      return kaguya.reply("This command can only be used in groups!");
    }

    const getThread = await Threads.find(event.threadID);

    const responses = {
      true: () => {
        if (args[0]) {
          Threads.update(event.threadID, { prefix: args[0] }).then(() => {
            kaguya.reply("Successfully changed your group's prefix to: " + args[0]);
          });
        } else {
          kaguya.reply(`The current prefix for your group is: ${getThread.data?.data?.prefix || "not set"}`);
        }
      },
      false: () => kaguya.reply("No information found for your group in the database"),
    };

    responses[getThread?.status || false]();
  },
};
