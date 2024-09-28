import fs from "fs";

export default {
  name: "حقيقة&جرأة",
  author: "Hussein Yacoubi",
  role: "member",
  description: "يُطرح على المستخدمين سؤال حقيقة أو تحدي (جرأة) بشكل عشوائي.",
  async execute({ api, args, event }) {
    const [arg1] = args;

    if (!arg1) {
      api.sendMessage("إذا كنت تريد لعب حقيقة أم جرأة، يرجى استخدام 'حقيقة&جرأة حقيقة' أو 'حقيقة&جرأة جرأة'.", event.threadID || event.senderID);
      return;
    }

    if (arg1.toLowerCase() === 'حقيقة') {
      const truthQuestions = JSON.parse(fs.readFileSync(`TRUTHQN.json`));
      const randomIndex = Math.floor(Math.random() * truthQuestions.length);
      const randomQuestion = truthQuestions[randomIndex];

      api.sendMessage(`هاهو سؤال الحقيقة: \n${randomQuestion}`, event.threadID || event.senderID);
    } else if (arg1.toLowerCase() === 'جرأة') {
      const dareChallenges = JSON.parse(fs.readFileSync(`DAREQN.json`));
      const randomIndex = Math.floor(Math.random() * dareChallenges.length);
      const randomChallenge = dareChallenges[randomIndex];

      api.sendMessage(`هاهو التحدي الذي يجب أن تقوم به: \n${randomChallenge}`, event.threadID || event.senderID);
    } else {
      api.sendMessage("استخدام غير صالح، يرجى استخدام 'حقيقة&جرأة حقيقة' لسؤال الحقيقة أو 'حقيقة&جرأة جرأة' لسؤال التحدي.", event.threadID || event.senderID);
    }
  }
};
