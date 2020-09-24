import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import adjNoun from 'adj-noun';

import config from './config.json';
import Bot from './discord/Bot';

const SEED_RANGE = 2147483648; // must be significantly smaller than Number.MAX_SAFE_INTEGER or adj-noun may give undefined stuff on fractional values

const initDatabase = async (db: Database<sqlite3.Database, sqlite3.Statement>) => {
  console.log('Database is empty, initializing database for the first time...');
  // CTF solve table for Discord Bot's mini CTF
  await db.exec('CREATE TABLE ctf_solves (user_id TEXT, challenge_name TEXT, solve_time TEXT);');
  console.log('Database initialization completed.');
};

const init = async () => {
  const seed = Math.floor(Math.random() * SEED_RANGE);
  console.log(`Using seed ${seed} for adj-noun`);
  adjNoun.seed(seed);
  const db = await open({
    filename: config.sqliteDbPath,
    driver: sqlite3.Database,
  });
  // Close database gracefully upon normal process kill (SIGTERM) or SIGINT (Ctrl-C on most terminals)
  const closeDB = () => {
    console.log('Closing database...');
    db.close().then(() => console.log('Database closed.')).catch(console.error).finally(() => process.exit());
  };
  process.on('SIGINT', closeDB);
  process.on('SIGTERM', closeDB);
  if (await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ctf_solves'") === undefined) {
    // ctf_solves table doesn't exist, then the database must be empty and need to be set up for the first time
    await initDatabase(db);
  }
  // initialize our discord bot and connect it
  const bot = new Bot(config.discord, db);
  bot.listen();
  await bot.connect();
};

init().then(() => console.log('Initialization completed')).catch((error) => {
  console.log('Initialization failed:');
  console.log(error);
});
