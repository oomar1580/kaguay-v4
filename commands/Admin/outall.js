class OutAll {
  constructor() {
    this.name = "outall";
    this.author = "Arjhil"; 
    this.cooldowns = 10; 
    this.description = "Makes the bot leave the group chat.";
    this.role = "admin"; 
    this.aliases = [];
  }

  async execute({ api, event }) {
    const { threadID } = event;
    
    try {
      await api.removeParticipant(threadID, global.config.BOT_ID);
      api.sendMessage("The bot has left the group chat.", threadID);
    } catch (error) {
      api.sendMessage("❌ An error occurred while trying to leave the group chat.", threadID);
      console.error("Error in outall command:", error);
    }
  }
}

export default new OutAll();
