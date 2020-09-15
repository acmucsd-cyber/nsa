import { User, Message, MessageEmbed } from 'discord.js';
import { timingSafeEqual } from 'crypto';
// import Bot from './Bot';
import roles from './roles';
import toolkit from './toolkit';
import commands from './command-strings';
import { channels } from '../config.json';

export const formatEmbed = ($embed: MessageEmbed) => {
  $embed
    .setColor(8388608)
    .setTitle('NSA')
    .setURL('http://github.com/acmucsd-cyber/nsa')
    .setFooter("I'm Watching You 👁️");
};
export const Roles = (message: Message, $embed: MessageEmbed) => {
  if (!(message.member?.roles.cache.find((role) => role.name === 'Goon' || role.name === 'Board' || role.name === 'Admin' || role.name === 'Discord Bot Dev'))) {
    $embed.setDescription(`Only Goons, Admins, Board, or Bot Devs can use this command. Check out <#${channels.roles}> to get roles.`);
    return;
  }
  if (message.channel.id !== channels.roles) { // ID of the roles channel
    $embed.setDescription('Please only use this command in the roles channel!');
    return;
  }
  message.channel.bulkDelete(10, true).then(() => { }).catch(() => { });
  let roleCat: MessageEmbed;
  roles.forEach((category) => {
    roleCat = new MessageEmbed()
      .setColor(8388608);
    roleCat.setTitle(category.category);
    category.roles.forEach((role) => {
      roleCat.addField(role.name, `<:${role.name.toLowerCase().replace(/\W/g, '')}:${role.emoteID}>`);
    });
    message.channel.send(roleCat)
      .then((reactMessage) => {
        category.roles.forEach((role) => {
          reactMessage.react(role.emoteID).then(() => { }).catch(() => {
            console.log(`Error reacting with ${role.name}`);
          });
        });
      }).catch(() => { });
  });
  $embed.setDescription(`Roles last updated on  ${new Date().toString()}`);
};

export const flag = (flagUsers: Set<User>, realFlag: Buffer, commandArgs: string[], message: Message, $embed: MessageEmbed) => {
  if (commandArgs.length === 2) {
    $embed.setDescription('Please make sure to include both a flag **and** a challenge');
    return;
  }
  if (flagUsers.has(message.author)) {
    $embed.setDescription('Please wait for your last flag submission to be processed first.');
    return;
  }
  setTimeout(() => {
    flagUsers.delete(message.author);
    const msg = new MessageEmbed();
    formatEmbed(msg);
    if (Buffer.from(commandArgs[2]).length === realFlag.length && timingSafeEqual(Buffer.from(commandArgs[2]), realFlag)) {
      msg.setDescription(`Congratulations! 🎉 You captured the flag for ${commandArgs[1]}.`);
      message.channel.send(msg).then(() => { }).catch(() => { });
      console.log(`User ${message.author.username} captured the flag for ${commandArgs[1]}!`);
      // TODO record this capture by this user. Store flag captures in some sort of database
    } else {
      msg.setDescription(`Sorry, your flag for ${commandArgs[1]} is incorrect.`);
      message.channel.send(msg).then(() => { }).catch(() => { });
    }
  }, 1000 + Math.random() * 2000);
  flagUsers.add(message.author);
  $embed.setDescription('Please wait while your flag is checked...');
};

export const roleremove = (message: Message, commandString: string[], $embed: MessageEmbed) => {
  if (commandString.length !== 2) {
    $embed.addFields(commands.find((command) => command.name === 'roleremove').fields);
    return;
  }
  if (message.member === null) {
    $embed.setDescription('Cannot remove role. Make sure you are messaging me in any ACM Cyber channel and not in DM.');
    return;
  }
  if (!message.member.roles.cache.find((role) => role.name.toLowerCase() === commandString[1])) {
    $embed.setDescription("You don't have that role.");
    return;
  }
  $embed.setDescription("That role can't be removed, sorry. Ask a Goon or Admin to remove it for you.");
  roles.forEach((category) => {
    if (category.roles.some((r) => r.name.toLowerCase() === commandString[1])) {
      message.guild?.member(message.member.user.id)?.roles.remove(category.roles.find((role) => role.name.toLowerCase() === commandString[1]).roleID).then(() => {
        console.log(`Removed ${message.member.user.username} from the ${commandString[1].toLowerCase()} role`);
        $embed.setDescription(`Removed you from the ${commandString[1].toLowerCase()} role.`);
      }).catch(() => { });
    }
  });
};

export const tk = (commandString: string[], $embed: MessageEmbed) => {
  if (toolkit.some((category) => category.name === commandString[1])) {
    $embed.addFields(toolkit.find((category) => category.name === commandString[1]).fields);
  } else {
    $embed.addFields(commands.find((command) => command.name === 'toolkit').fields);
  }
};

export const resources = ($embed: MessageEmbed) => {
  let content: string;
  channels.categories.forEach((category) => {
    content = '';
    category.channels.forEach((id) => {
      content += `<#${id}>\n`;
    });
    $embed.addField(category.name, content);
  });
};
