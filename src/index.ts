import config from './config.json';
import Bot from './discord/Bot';

// initialize our discord bot and connect it
const bot = new Bot(config.discord);
// bot.connect();
bot.listen();
bot.connect().then(() => { }).catch(() => { });
