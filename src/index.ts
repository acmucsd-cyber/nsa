import config from './config.json'
import Bot from './discord/Bot'

// initialize our discord bot and connect it
new Bot(config.discord).connect()