import config from './config.json'
import Bot from './discord/Bot'

// initialize our discord bot and connect it
const bot = new Bot(config.discord);
//bot.connect();
bot.listen()
    .then(() => {
        bot.connect();
    })
    .catch((error) => {
        console.log('Uh oh, \n', error);
    })