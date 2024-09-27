import Table from 'cli-table3';
import chalk from 'chalk';

class ConsoleOutput {
  name = 'الكونسل';
  author = 'Arjhil Dacayanan';
  cooldowns = 60;
  description = 'يعرض الرسائل على الكونسل !';
  role = 'owner';
  aliases = [];

  truncateString(str, maxLength) {
    return str.length <= maxLength ? str : `${str.slice(0, maxLength - 3)}...`;
  }

  async events({ event, Threads, Users }) {
    if (kaguya.isBot()) return;
    if (!['message', 'message_reply', 'message_reaction'].includes(event.type)) return;
    const { threadID, senderID, body } = event;
    const threadName = (await Threads.find(threadID))?.data?.data?.name || 'Unknown';
    const nameUser = (await Users.find(senderID))?.data?.data?.name || 'Unknown';

    const getRandomColor = () => '#' + ["FF9900", "FFFF33", "33FFFF", "FF99FF", "FF3366", "FFFF66", "FF00FF", "66FF99", "00CCFF", "FF0099", "FF0066", "008E97", "F58220", "38B6FF", "7ED957"][Math.floor(Math.random() * 15)];

    const [random1, random2, random3] = [getRandomColor(), getRandomColor(), getRandomColor()];

    const table = new Table({
      chars: {
        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
        'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
        'right': '║', 'right-mid': '╢', 'middle': '│'
      },
      style: { head: [], border: [] }
    });

    table.push(
      [{ colSpan: 10, hAlign: 'left', content: chalk.hex(random1)(`Group: ${threadName} | ${event.threadID}`) }],
      [{ colSpan: 10, hAlign: 'left', content: chalk.hex(random2)(`Name: ${nameUser}`) }],
      [{ colSpan: 10, hAlign: 'left', content: chalk.hex(random3)(`Message: ${this.truncateString(body || 'Image, video, or special characters', 40)}`) }]
    );

    console.log(table.toString());
  }

  async execute() {}
}

export default new ConsoleOutput();
