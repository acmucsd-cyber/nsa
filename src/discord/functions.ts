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

const validateInput = (input: string, base: string) => {
  let isValid: boolean;
  switch (base) {
    case 'a':
      isValid = true;
      break;
    case 'h':
      isValid = (/^(0[xX])?[A-Fa-f0-9]+$/.test(input));
      break;
    case 'b':
      isValid = (/^[0-1 ]{1,}$/.test(input));
      break;
    case 'd':
      isValid = (/^[0-9 ]{1,}$/.test(input));
      break;
    case '6':
      isValid = (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input));
      break;
    default:
      isValid = false;
      break;
  }
  return isValid;
};

const fromASCII = (command: string[]) => {
  let output = '';
  switch (command[0]) {
    case 'b':
      output = command[1].split('').map((char) => char.charCodeAt(0).toString(2)).join(' ');
      break;
    case 'd':
      for (let i = 0; i < command[1].length; i += 1) {
        output += `${command[1].charCodeAt(i)} `;
      }
      break;
    case 'h':
      output = `0x${Buffer.from(command[1]).toString('hex')}`;
      break;
    case '6':
      output = Buffer.from(command[1]).toString('base64');
      break;
    case 'a':
      // eslint-disable-next-line
      output = command[1];
      break;
    default:
      output = 'Oh no, something went wrong!';
  }
  return output.trim();
};

const fromHex = (command: string[]) => {
  let output = '';
  let hexVals: number[];
  if (command[1].substring(0, 2) === '0x') {
    hexVals = command[1].match(/.{1,2}/g).slice(1).map((value) => parseInt(value, 16));
  } else {
    hexVals = command[1].match(/.{1,2}/g).map((value) => parseInt(value, 16));
  }
  switch (command[0]) {
    case 'b':
      for (let i = 0; i < hexVals.length; i += 1) {
        output += `${hexVals[i].toString(2)} `;
      }
      break;
    case 'd':
      for (let i = 0; i < hexVals.length; i += 1) {
        output += `${hexVals[i].toString(10)} `;
      }
      break;
    case 'h':
      // eslint-disable-next-line
      output = command[1];
      break;
    case '6':
      output = Buffer.from(hexVals).toString('base64');
      break;
    case 'a':
      output = Buffer.from(hexVals).toString('utf8');
      break;
    default:
      output = 'Oh no, something went wrong!';
  }
  return output.trim();
};

const fromBinary = (command: string[]) => {
  const binVals = command[1].split(' ').map((value) => parseInt(value, 2));
  let output = '';
  switch (command[0]) {
    case 'b':
      // eslint-disable-next-line
      output = command[1];
      break;
    case 'd':
      for (let i = 0; i < binVals.length; i += 1) {
        output += `${binVals[i].toString(10)} `;
      }
      break;
    case 'h':
      output = `0x${Buffer.from(binVals).toString('hex')}`;
      break;
    case '6':
      output = Buffer.from(binVals).toString('base64');
      break;
    case 'a':
      output = Buffer.from(binVals).toString('utf8');
      break;
    default:
      output = 'Oh no, something went wrong!';
  }
  return output.trim();
};

const fromBase64 = (command: string[]) => {
  let output = '';
  let temp: number[];
  switch (command[0]) {
    case 'b':
      temp = Buffer.from(command[1], 'base64').toString('hex').match(/.{1,2}/g).map((value) => parseInt(value, 16));
      for (let i = 0; i < temp.length; i += 1) {
        output += `${temp[i].toString(2)} `;
      }
      break;
    case 'd':
      temp = Buffer.from(command[1], 'base64').toString('hex').match(/.{1,2}/g).map((value) => parseInt(value, 16));
      for (let i = 0; i < temp.length; i += 1) {
        output += `${temp[i].toString(10)} `;
      }
      break;
    case 'h':
      output = `0x${Buffer.from(command[1], 'base64').toString('hex')}`;
      break;
    case '6':
      // eslint-disable-next-line
      output = command[1];
      break;
    case 'a':
      output = Buffer.from(command[1], 'base64').toString('utf8');
      break;
    default:
      output = 'Oh no, something went wrong!';
  }
  return output.trim();
};

const fromDecimal = (command: string[]) => {
  let output = '';
  const decVals = command[1].split(' ').map((value) => parseInt(value, 10));
  switch (command[0]) {
    case 'b':
      for (let i = 0; i < decVals.length; i += 1) {
        output += `${decVals[i].toString(2)} `;
      }
      break;
    case 'd':
      // eslint-disable-next-line
      output = command[1];
      break;
    case 'h':
      output = `0x${decVals.map((value) => value.toString(16)).join('')}`;
      break;
    case '6':
      output = Buffer.from(decVals).toString('base64');
      break;
    case 'a':
      output = decVals.map((value) => String.fromCharCode(value)).join('');
      break;
    default:
      output = 'Oh no, something went wrong!';
  }
  return output.trim();
};

export const convert = (commandString: string[], embed: MessageEmbed) => {
  let output = '';
  if (commandString.length < 4 || commandString[1].length > 1 || commandString[2].length > 1) {
    embed.addFields(commands.find((command) => command.name === 'convert').fields);
    return;
  }
  if (!/[abdh6]/.test(commandString[1].toLowerCase())) {
    embed.setDescription('Error: invalid original encoding.');
    return;
  }
  if (!/[abdh6]/.test(commandString[2].toLowerCase())) {
    embed.setDescription('Error: invalid conversion encoding.');
    return;
  }
  if (!validateInput(commandString.slice(3).join(' ').trim(), commandString[1])) {
    embed.setDescription('Error: unexpected character in string.');
    return;
  }
  switch (commandString[1]) {
    case 'a':
      output = fromASCII([commandString[2].toLowerCase(), commandString.slice(3).join(' ').trim()]);
      break;
    case 'b':
      output = fromBinary([commandString[2].toLowerCase(), commandString.slice(3).join(' ').trim()]);
      break;
    case 'd':
      output = fromDecimal([commandString[2].toLowerCase(), commandString.slice(3).join(' ').trim()]);
      break;
    case 'h':
      output = fromHex([commandString[2].toLowerCase(), commandString.slice(3).join(' ').trim()]);
      break;
    case '6':
      output = fromBase64([commandString[2].toLowerCase(), commandString.slice(3).join(' ').trim()]);
      break;
    default:
      output = 'Oh no, something went wrong!';
  }

  embed.setDescription(output);
};
