import axios from "axios";

class MixtralCommand {
  name = "mixtral";
  author = "Arjhil Dacayanan";
  cooldowns = 60;
  description = "Fetches a response from the Mixtral-8B API";
  role = "member";

  async execute({ event }) {
    try {
      const prompt = encodeURIComponent(event.body || "");
      if (!prompt) {
        return kaguya.reply("🤖 Usage: mixtral <your prompt>");
      }

      const apiUrl = `https://deku-rest-api.gleeze.com/api/mixtral-8b?q=${prompt}`;
      const response = await axios.get(apiUrl);

      console.log("API Response:", response.data);

      const mixtralResponse = response.data.answer || response.data.result || "No valid response from the Mixtral API";

      const formattedMessage = `
Kaguya Mixtral-8B Response 📜:

━━━━━━━━━━━━━━━

${mixtralResponse}

━━━━━━━━━━━━━━━
`;

      return kaguya.reply(formattedMessage);
    } catch (err) {
      console.error('Error calling the Mixtral API:', err.message);
      return kaguya.reply("🤖 An unexpected error occurred while calling the Mixtral API.");
    }
  }
}

export default new MixtralCommand();
