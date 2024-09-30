class OutAll {
  constructor() {
    this.name = "مغادرة-الجميع";
    this.author = "Arjhil"; 
    this.cooldowns = 10; 
    this.description = "اجعل البوت يغادر كل المجموعات.";
    this.role = "admin"; 
    this.aliases = ["مغادرة-الكل"];
  }

  async execute({ api, event }) {
    const { threadID } = event;
    
    try {
      await api.removeParticipant(threadID, global.config.BOT_ID);
      api.sendMessage("✅ | تمت المغادرة من جميع المجموعات", threadID);
    } catch (error) {
      api.sendMessage("❌ An error occurred while trying to leave the group chat.", threadID);
      console.error("Error in outall command:", error);
    }
  }
}

export default new OutAll();
