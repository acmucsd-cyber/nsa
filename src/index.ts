import config from './config.json';
import Bot from './discord/Bot';

// initialize our discord bot and connect it
const bot = new Bot(config.discord);

bot.listen();
bot.connect()
    .then((client) => console.log(`Logged in as: ${client.user.tag}`))
    .catch((err) => console.log(`Failed to connect to discord! Error: ${err}`));
