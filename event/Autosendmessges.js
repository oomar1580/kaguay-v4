import cron from 'node-cron';

export default {
  name: "autosendmessages",
  execute: async ({ api, event }) => {
    try {
      // Function to send a message to all groups
      function sendMessageToGroups(text) {
        api.getThreadList(30, null, ["INBOX"], (err, list) => {
          if (err) return console.error("Error getting thread list:", err);
          list.forEach(thread => {
            if (thread.isGroup === true && thread.threadID !== event.threadID) {
              api.sendMessage(text, thread.threadID);
            }
          });
        });
      }

      // Schedule 7 messages with cron jobs
      // Message 1: 9:00 AM
      cron.schedule('0 0 9 * * *', () => {
        sendMessageToGroups(global.convertToGothic(`إنها التاسعة صباحا !\nوليس كل ماصرفه الله عنك شرٌ لك لعلك أنت الخير الذي لا يستحقونه 💙💙.
𝑨𝒏𝒅 𝒏𝒐𝒕 𝒆𝒗𝒆𝒓𝒚𝒕𝒉𝒊𝒏𝒈 𝒕𝒉𝒂𝒕 𝑮𝒐𝒅 𝒔𝒑𝒆𝒏𝒕 𝒇𝒓𝒐𝒎 𝒚𝒐𝒖 𝒊𝒔 𝒆𝒗𝒊𝒍 𝒇𝒐𝒓 𝒚𝒐𝒖, 𝒑𝒆𝒓𝒉𝒂𝒑𝒔 𝒚𝒐𝒖 𝒂𝒓𝒆 𝒕𝒉𝒆 𝒈𝒐𝒐𝒅 𝒕𝒉𝒂𝒕 𝒕𝒉𝒆𝒚 𝒅𝒐 𝒏𝒐𝒕 𝒅𝒆𝒔𝒆𝒓𝒗𝒆.💙💙`));
      }, {
        scheduled: true,
        timezone: "Africa/Casablanca"
      });

      cron.schedule('0 0 10 * * *', () => {
        sendMessageToGroups(global.convertToGothic(`إنها العاشرة صباحا !\nلا شي يبقـــى للأبد حتى الشمس سـتگسر القانون يوماً وتشرق غرباً لتعلن النهاية🌷✨
𝑵𝑶𝑻𝑯𝑰𝑵𝑮 𝑹𝑬𝑴𝑨𝑰𝑵𝑺 𝑭𝑶𝑹𝑬𝑽𝑬𝑹, 𝑼𝑵𝑻𝑰𝑳 𝑻𝑯𝑬 𝑺𝑼𝑵 𝑾𝑰𝑳𝑳 𝑩𝑹𝑬𝑨𝑲 🌷✨`));
      }, {
        scheduled: true,
        timezone: "Africa/Casablanca"
      });

      // Message 2: 11:00 AM
      cron.schedule('0 0 11 * * *', () => {
        sendMessageToGroups(global.convertToGothic(`إنها الحادية عشرة صباحا !\n𝑫𝒐𝒏'𝒕 𝒕𝒓𝒖𝒔𝒕 𝒔𝒐𝒎𝒆𝒐𝒏𝒆 𝒋𝒖𝒔𝒕 𝒃𝒆𝒄𝒂𝒖𝒔𝒆 𝒚𝒐𝒖 𝒍𝒊𝒌𝒆 𝒕𝒂𝒍𝒌𝒊𝒏𝒈𝑾𝒊𝒕𝒉 𝒉𝒊𝒎, 𝒍𝒊𝒇𝒆 𝒉𝒂𝒔 𝒃𝒆𝒄𝒐𝒎𝒆 𝒂𝒔𝒑𝒆𝒄𝒕𝒔 𝒕𝒉𝒂𝒕 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒄𝒐𝒏𝒕𝒆𝒎𝒑𝒍𝒂𝒕𝒆 𝒘𝒆𝒍𝒍. 🦋✨
-لاتثق بشخص لمجرد اعجبك الحديث
معة فالحياة أصبحت مظاهر تاملوها جيدا .🦋✨`));
      }, {
        scheduled: true,
        timezone: "Africa/Casablanca"
      });

      // Message 3: 12:00 PM
      cron.schedule('0 0 12 * * *', () => {
        sendMessageToGroups(global.convertToGothic(`إنها الثانية عشر ظهرا !\n‏النظرات قادرة على اختصار حديث 
من سبعين ألف كلمة.🤎
“𝑳𝒐𝒐𝒌𝒔 𝒄𝒂𝒏 𝒔𝒉𝒐𝒓𝒕𝒆𝒏 𝒂 𝒄𝒐𝒏𝒗𝒆𝒓𝒔𝒂𝒕𝒊𝒐𝒏 
𝑺𝒆𝒗𝒆𝒏𝒕𝒚 𝒕𝒉𝒐𝒖𝒔𝒂𝒏𝒅 𝒘𝒐𝒓𝒅𝒔🤎`));
      }, {
        scheduled: true,
        timezone: "Africa/Casablanca"
      });

      cron.schedule('0 0 13 * * *', () => {
        sendMessageToGroups(global.convertToGothic(`إنها الواحدة ظهرا !\n𝑰 𝒈𝒂𝒗𝒆 𝒎𝒚 𝒇𝒆𝒆𝒍𝒊𝒏𝒈𝒔 𝒂𝒏𝒅 𝒆𝒏𝒆𝒓𝒈𝒚 𝒐𝒏𝒄𝒆, 𝒂𝒏𝒅 𝒉𝒆𝒓𝒆 𝑰 𝒇𝒆𝒍𝒍 𝒘𝒊𝒕𝒉 𝒎𝒚 𝒘𝒉𝒐𝒍𝒆 𝒘𝒆𝒊𝒈𝒉𝒕 𝒂𝒏𝒅 𝒄𝒐𝒖𝒍𝒅 𝒏𝒐𝒕 𝒈𝒆𝒕 𝒖𝒑. 🖤
لقد وهبتُ مشاعري و طاقتي مرةً واحدة وها أنا سَقطت بثقلي كله و لم أستطيع النهوض`));
      }, {
        scheduled: true,
        timezone: "Africa/Casablanca"
      });

        // Message 4: 3:00 PM
        cron.schedule('0 0 15 * * *', () => {
          sendMessageToGroups(global.convertToGothic(`إنها الثالثة مساءا !\nلا يـهـمـني إن غادرنـي الـجـميـع ، فـمـنذ الـبـدايـة ارسـم مـسـتـقبلا لايـوجـد فيه احد..🤍🪐

𝑱𝒆 𝒎𝒆 𝒇𝒊𝒄𝒉𝒆 𝒒𝒖𝒆 𝒕𝒐𝒖𝒕 𝒍𝒆 𝒎𝒐𝒏𝒅𝒆 𝒎𝒆 𝒕𝒓𝒂𝒉𝒊𝒔𝒔𝒆, 𝒅𝒆𝒑𝒖𝒊𝒔 𝒍𝒆 𝒅é𝒃𝒖𝒕 𝒋𝒆 𝒅𝒆𝒔𝒔𝒊𝒏𝒆 𝒖𝒏 𝒂𝒗𝒆𝒏𝒊𝒓 𝒐ù 𝒊𝒍 𝒏'𝒚 𝒂 𝒑𝒆𝒓𝒔𝒐𝒏𝒏𝒆..🤍🪐💗🍯`));
        }, {
          scheduled: true,
          timezone: "Aftica/Casablanca"
        });

        // Message 5: 6:00 PM
        cron.schedule('0 0 18 * * *', () => {
          sendMessageToGroups(global.convertToGothic(`إنها السادسة مساءا !\n𝑯𝒐𝒘𝒆𝒗𝒆𝒓 𝒅𝒊𝒇𝒇𝒊𝒄𝒖𝒍𝒕 𝒍𝒊𝒇𝒆 𝒎𝒂𝒚 𝒔𝒆𝒆𝒎, 𝒕𝒉𝒆𝒓𝒆 𝒊𝒔 𝒂𝒍𝒘𝒂𝒚𝒔 𝒔𝒐𝒎𝒆𝒕𝒉𝒊𝒏𝒈 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒅𝒐 𝒂𝒏𝒅 𝒔𝒖𝒄𝒄𝒆𝒆𝒅 𝒂𝒕🩵✨
‏مهما بدت الحياة صعبه، يوجد دائمًا شيءٌ يمكنك النجاح فيه.🩵✨`));
        }, {
          scheduled: true,
          timezone: "Aftica/Casablanca"
        });

        // Message 6: 8:00 PM
        cron.schedule('0 0 20 * * *', () => {
          sendMessageToGroups(global.convertToGothic(`إنها الثامنة مساءا !\n𝘾𝙧𝙮𝙞𝙣𝙜 i𝙮s 𝙣𝙤𝙩 𝙖 𝙨𝙞𝙜𝙣 𝙤𝙛 𝙬𝙚𝙖𝙠𝙣𝙚𝙨𝙨. 𝙎𝙤𝙢𝙚𝙩𝙞𝙢𝙚𝙨 𝙖 𝙥𝙚𝙧𝙨𝙤𝙣 𝙘𝙧𝙞𝙚𝙨 𝙗𝙚𝙘𝙖𝙪𝙨𝙚 𝙝𝙚 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙨𝙩𝙧𝙤𝙣𝙜 𝙛𝙤𝙧 𝙖 𝙡𝙤𝙣𝙜 𝙩𝙞𝙢𝙚. 🖤🥀
ليس البكاء دليل على الضعف، أحيانًا يبكي الشخص لأنه كان قوي لفترة طويلة.🖤🥀`));
        }, {
          scheduled: true,
          timezone: "Aftica/Casablanca"
        });

        // Message 7: 10:00 PM
        cron.schedule('0 0 22 * * *', () => {
          sendMessageToGroups(global.convertToGothic(`إنها العاشرة مساءا !\nأن يَكون لك صَديق يَراك وكأنّك الخير في
هذهِ الأرض، شُعور لا يُمكنك أن تَضعه في
كلماتٍ مُناسِبة.💖"
𝙏𝙤 𝙝𝙖𝙫𝙚 𝙖 𝙛𝙧𝙞𝙚𝙣𝙙 𝙬𝙝𝙤 𝙨𝙚𝙚𝙨 𝙮𝙤𝙪 𝙖𝙨 𝙩𝙝𝙚 𝙗𝙚𝙨𝙩 𝙞𝙣 𝙮𝙤𝙪
𝙏𝙝𝙞𝙨 𝙚𝙖𝙧𝙩𝙝, 𝙖 𝙛𝙚𝙚𝙡𝙞𝙣𝙜 𝙮𝙤𝙪 𝙘𝙖𝙣'𝙩 𝙥𝙪𝙩 𝙞𝙣
𝙎𝙪𝙞𝙩𝙖𝙗𝙡𝙚 𝙬𝙤𝙧𝙙𝙨.💖`));
        }, {
          scheduled: true,
          timezone: "Aftica/Casablanca"
        });
      }

    } catch (error) {
      console.error("Error executing autosendmessages:", error);
    }
  },
};
