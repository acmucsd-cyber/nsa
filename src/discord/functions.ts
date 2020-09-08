import Bot from './Bot';
import { User, Message, MessageEmbed } from 'discord.js';
import roles from './roles';
import toolkit from './toolkit';
import commands from './command-strings';
import { channels } from '../config.json';

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
      roleCat.addField(role.name, `<:${role.name.toLowerCase().replace(/[^a-z]/g, '')}:${role.emoteID}>`);
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

export const processCTFCommand = (bot: Bot, commandArgs: string[], invoker: User, msgReply: (msg: string) => void): string => { // TODO make submitting flags DM only
  // let badUsage = false;
  let error = '';
  const template = `Usage: -ctf`;
  const flagHelp = `${template} flag CHALLENGE_NAME FLAG`;
  if (commandArgs.length === 0) {
    error = 'Error: No command specified\n';
  } else {
    switch (commandArgs[0]) {
      case 'flag': {
        let cmdError = '';
        if (commandArgs.length === 3) {
          const chalName = commandArgs[1];
          if (bot.ctf.validateChallengeName(chalName)) {
            if (bot.checkingFlag.has(invoker)) {
              return 'Please wait for your last flag submission to be processed first.';
            }
            setTimeout(() => {
              bot.checkingFlag.delete(invoker);
              let reply: string;
              const correct = bot.ctf.checkFlag(chalName, commandArgs[2]);
              if (correct) {
                reply = `Congratulations! 🎉 You captured the flag for ${chalName}.`;
                console.log(`User ${invoker.username} captured the flag for ${chalName}!`);
                // TODO record this capture by this user.
              } else {
                reply = `Sorry, your flag for ${chalName} is incorrect.`;
              }
              msgReply(reply);
            }, 1000 + Math.random() * 2000); // TODO if it fails (with an exception) automatically delete invoker from bot.checkingFlag to avoid deadlocks
            // timeout range from 1 to 3 seconds
            bot.checkingFlag.add(invoker);
            return `Checking flag for ${chalName}...`;
          }
          cmdError = `Error: ${chalName} is not a challenge name.\n`;// TODO: give a list of valid challenge names
        } else {
          cmdError = 'Error: You must specify both the challenge name and the flag you want to submit\n';
        }
        return cmdError + flagHelp;
      }
      // TODO: a command to read challenge description
      case 'help':
        if (commandArgs.length === 2) {
          switch (commandArgs[1]) {
            case 'flag':
              return flagHelp;
            case 'help':
              break;
            default:
              error = `Error: ${commandArgs[1]} is not a command\n`;
          }
        }/*  else {
          error = "Error: please specify a command to get help on";
        } */
        break;
      default:
        error = `Error: ${commandArgs[0]} is not a command\n`;
    }
  }
  return `${error}${template} COMMAND\n\nwhere COMMAND is one of the following:\nflag: submit and check CTF flag\nhelp COMMAND: get help on a specific command`;
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
  let msg = "That role can't be removed, sorry. Ask a Goon or Admin to remove it for you.";
  roles.forEach((category) => {
    if (category.roles.some((r) => r.name.toLowerCase() === commandString[1])) {
      message.guild?.member(message.member.user.id)?.roles.remove(category.roles.find((role) => role.name.toLowerCase() === commandString[1]).roleID).then(() => {
        console.log(`Removed ${message.member.user.username} from the ${commandString[1].toLowerCase()} role`);
        msg = `Removed you from the ${commandString[1].toLowerCase()} role.`;
      }).catch(() => { });
    }
  });
  $embed.setDescription(msg);
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
