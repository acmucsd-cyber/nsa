import { timingSafeEqual } from 'crypto';
import { Message, MessageEmbed } from 'discord.js';
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import roles from './roles';
import toolkit from './toolkit';
import commands from './command-strings';
import { channels } from '../config.json';

export const formatEmbed = ($embed: MessageEmbed) => {
  $embed
    .setColor(8388608)
    .setTitle('NSA')
    .setURL('https://github.com/acmucsd-cyber/nsa')
    .setFooter("I'm Watching You 👁️");
};

export const flag = async (db: Database<sqlite3.Database, sqlite3.Statement>, flagUsers: Set<string>, realFlag: Buffer, commandArgs: string[], message: Message, embed: MessageEmbed) => {
  if (commandArgs.length === 2) {
    embed.setDescription('Please make sure to include the challenge name **as well as** the flag you got.');
    return;
  }
  if (commandArgs.length > 3) {
    embed.setDescription('Too many arguments provided. Please put exactly one flag after the challenge name.');
    return;
  }
  if (flagUsers.has(message.author.id)) {
    embed.setDescription('Please wait for your last flag submission to be processed first.');
    return;
  }
  if (await db.get('SELECT * FROM ctf_solves WHERE user_id = ? AND challenge_name = ?',
    [message.author.id, commandArgs[1]]) !== undefined) {
    embed.setDescription('You already solved this challenge.');
    return;
  }
  const checkFlags = async () => {
    const msg = new MessageEmbed();
    formatEmbed(msg);
    if (Buffer.from(commandArgs[2]).length === realFlag.length && timingSafeEqual(Buffer.from(commandArgs[2]), realFlag)) {
      console.log(`User ${message.author.tag} captured the flag for ${commandArgs[1]}.`);
      await db.run('INSERT INTO ctf_solves VALUES (?, ?, strftime("%Y-%m-%d %H:%M:%f", "now"));',
        [message.author.id, commandArgs[1]]);
      msg.setDescription(`Congratulations! 🎉 You captured the flag for ${commandArgs[1]}.`);
    } else {
      msg.setDescription(`Sorry, your flag for ${commandArgs[1]} is incorrect.`);
    }
    await message.channel.send(msg);
  };
  setTimeout(() => {
    checkFlags().catch((error) => {
      console.error(`Failed to check flag for user ${message.author.tag}`);
      console.error(error);
    }).finally(() => { flagUsers.delete(message.author.id); });
  }, 1500);
  flagUsers.add(message.author.id);
  embed.setDescription('Please wait while your flag is checked...');
};

export const roleremove = async (message: Message, commandString: string[], embed: MessageEmbed) => {
  if (commandString.length !== 2) {
    embed.addFields(commands.find((command) => command.name === 'roleremove').fields);
    return;
  }
  if (message.member === null) {
    throw Error('Cannot remove role. Make sure you are messaging me in any ACM Cyber channel and not in DM.');
  }
  if (!message.member.roles.cache.some((role) => role.name.toLowerCase() === commandString[1])) {
    throw Error("You don't have that role.");
  }

  embed.setDescription("That role can't be removed, sorry. Ask a Goon or Admin to remove it for you.");
  const toRemove = [];
  roles.forEach((category) => {
    const roletoremove = category.roles.find((role) => role.name.toLowerCase() === commandString[1])?.roleID;

    if (roletoremove) {
      toRemove.push(message.guild?.member(message.member.user.id)?.roles.remove(roletoremove));
    }
  });

  (await Promise.all(toRemove)).forEach(() => {
    console.log(`Removed ${message.member.user.username} from the ${commandString[1].toLowerCase()} role`);
    embed.setDescription(`Removed you from the ${commandString[1].toLowerCase()} role.`);
  });
};

export const tk = (commandString: string[], embed: MessageEmbed) => {
  if (toolkit.some((category) => category.name === commandString[1])) {
    embed.addFields(toolkit.find((category) => category.name === commandString[1]).fields);
  } else {
    embed.addFields(commands.find((command) => command.name === 'toolkit').fields);
  }
};

export const resources = (embed: MessageEmbed) => {
  let content: string;
  channels.categories.forEach((category) => {
    content = '';
    category.channels.forEach((id) => {
      content += `<#${id}>\n`;
    });
    embed.addField(category.name, content);
  });
};
