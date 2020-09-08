import {
  Client, Message, MessageEmbed, MessageReaction, User,
} from 'discord.js';
import roles from './roles';
import commands from './command-strings';
import { generateName } from './name-gen';
import * as functions from './functions';
import { channels } from '../config.json';
import { CTF } from './ctf';

export default class Bot {
  private readonly client: Client;

  private readonly config: DiscordConfig;

  private readonly ctf: CTF;

  private checkingFlag = new Set<User>();

  constructor(config: DiscordConfig) {
    this.client = new Client();
    this.config = config;
    this.ctf = new CTF(config.flags);
  }

  public async connect() {
    // Connects to Discord
    try {
      await this.client.login(this.config.token);
      console.log(`Logged in as: ${this.client.user.tag}`);
      await this.client.user.setActivity('You', { type: 'WATCHING' });
    } catch {
      console.log('Failed to login');
    }
  }

  public listen() {
    this.client.on('guildMemberAdd', (member) => {
      if (member.user.bot) return;
      console.log('A new member has joined');
      member.send(`Welcome to ACM Cyber! We’re excited to have you with us during our first year as a student organization.\n Our three pillars (Learn, Practice, and Participate) drive our decisions as a club and the events we hold. As you know, we host technical events to introduce our members to various concepts in cybersecurity and industry panels to form connections with the greater computing community. We are always open for feedback for workshops and any ideas for events we can hold! If you have an idea about an event you’d like to see come to fruition, pitch it in the Ideas channel! This channel is for you to voice your opinion about anything you would like to see! Whether you would like to teach a workshop yourself or have us hold a workshop on this topic, please let us know through this channel! \n **First, however, please read the rules in <#${channels.rules}> and introduce yourself in <#${channels.introductions}> to gain access to the rest of the server.**`).then(() => { })
        .catch(() => {
          console.log(`Oh no, there was an issue messaging ${member.user.tag}`);
        });
    });

    this.client.on('message', this.messageHandle);

    this.client.on('messageReactionAdd', this.messageReactionAddHandle);
    this.client.on('messageReactionRemove', this.messageReactionRemoveHandle);
  }

  processCTFCommand = (commandArgs: string[], invoker: User, msgReply: (msg: string) => void): string => {
    // let badUsage = false;
    let error = "";
    let template = `Usage: ${this.config.prefix}ctf`;
    let flagHelp = `${template} flag CHALLENGE_NAME FLAG`;
    if (commandArgs.length == 0) {
      error = "Error: No command specified\n";
    } else {
      switch (commandArgs[0]) {
        case "flag":
          let cmdError = "";
          if (commandArgs.length == 3) {
            let chalName = commandArgs[1];
            if (this.ctf.validateChallengeName(chalName)) {
              if (this.checkingFlag.has(invoker)) {
                return `Please wait for your last flag submission to be processed first.`;
              }
              setTimeout(() => {
                this.checkingFlag.delete(invoker);
                let reply: string, correct = this.ctf.checkFlag(chalName, commandArgs[2]);
                if (correct) {
                  reply = `Congratulations! 🎉 You captured the flag for ${chalName}.`;
                  console.log(`User ${invoker.username} captured the flag for ${chalName}!`);
                  // TODO record this capture by this user.
                } else {
                  reply = `Sorry, your flag for ${chalName} is incorrect.`;
                }
                msgReply(reply);
              }, 1000 + Math.random() * 2000); // TODO if it fails (with an exception) automatically delete invoker from this.checkingFlag to avoid deadlocks
              // timeout range from 1 to 3 seconds
              this.checkingFlag.add(invoker);
              return `Checking flag for ${chalName}...`;
            } else {
              cmdError = `Error: ${chalName} is not a challenge name.\n`;
              // TODO: give a list of valid challenge names
            }
          } else {
            cmdError = "Error: You must specify both the challenge name and the flag you want to submit";
          }
          return cmdError + flagHelp;
        // TODO: a command to read challenge description
        case "help":
          if (commandArgs.length == 2) {
            switch (commandArgs[1]) {
              case "flag":
                return flagHelp;
              case "help":
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
  }

  getReplyTempate = (): MessageEmbed => {
    return new MessageEmbed()
      .setColor(8388608)
      .setTitle('NSA')
      .setURL('http://github.com/acmucsd-cyber/nsa')
      .setFooter("I'm Watching You 👁️");
  }

  messageHandle = (message: Message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(this.config.prefix)) {
      if (message.channel.id === channels.introductions // Message is in the introductions channel
        && message.content.includes(' ') // Message is longer than one word
        && message.member // Person is real
        && !(message.member.roles.cache.has('742797850630684762'))) { // ID of "member" role
        message.member.roles.add('742797850630684762').then(() => {
          console.log(`Gave member role to ${message.member.user.tag}`);
          message.member.send(`Great! Get some roles over in <#${channels.roles}> to connect with others who share your interests and join the discussion in <#${channels.lobby}>!`).then(() => { })
            .catch(() => {
              console.log(`Oh no, there was an issue messaging ${message.member.user.tag}`);
            });
        }).catch(() => {
          console.log(`Oh no, there was an issue giving ${message.member.user.tag} the member role`);
        });
      }
    } else {
      const commandString = message.content.substr(this.config.prefix.length).trim().split(' ');
      const reply = this.getReplyTempate();
      switch (commandString[0].toLowerCase()) {
        case 'toolkit':
        case 'tk':
          functions.tk(commandString, reply);
          break;
        case 'name':
          reply.setDescription(`What about this name:\n **${generateName(commandString)}**`);
          break;
        case 'help':
        case 'gettingstarted':
        case 'faq':
          reply.addFields(commands.find((command) => command.name === commandString[0].toLowerCase()).fields);
          break;
        case 'resources':
          functions.resources(reply);
          break;
        case 'roles':
          functions.Roles(message, reply);
          break;
        case 'roleremove':
          functions.roleremove(message, commandString, reply);
          break;
        case "ctf":
          reply.setDescription(this.processCTFCommand(commandString.slice(1), message.author, (ctfReplyMsg) => {
            let ctfReply = this.getReplyTempate();
            ctfReply.setDescription(ctfReplyMsg);
            message.channel.send(ctfReply).then(() => {
              console.log('Sent flag submission response');
            }).catch(() => { });
          }));
          break;
        default:
          reply.setDescription('Unknown command!');
      }

      message.channel.send(reply).then(() => {
        console.log('Response sent');
      }).catch(() => { });
    }
  };

  messageReactionAddHandle = (messageReaction: MessageReaction, user: User) => {
    if (user.bot) return;
    if (messageReaction.message.channel.id === channels.roles) { // Roles Channel ID
      const memberRoles = messageReaction.message.guild?.member(user.id)?.roles;
      roles.forEach((category) => {
        category.roles.forEach((role) => {
          if (role.emoteID === messageReaction.emoji.id && !memberRoles.cache.some((memberRole) => memberRole.id === role.roleID)) {
            memberRoles.add(role.roleID).then(() => {
              console.log(`Added ${user.username} to the ${role.name} role`);
            }).catch(() => {
              console.log(`Oh no, there was an issue removing ${user.username} from the ${role.name} role`);
            });
          }
        });
      });
    }
  };

  messageReactionRemoveHandle = (messageReaction: MessageReaction, user: User) => {
    if (user.bot) return;
    if (messageReaction.message.channel.id === channels.roles) { // Roles Channel ID
      const memberRoles = messageReaction.message.guild?.member(user.id)?.roles;
      roles.forEach((category) => {
        category.roles.forEach((role) => {
          if (role.emoteID === messageReaction.emoji.id && memberRoles.cache.some((memberRole) => memberRole.id === role.roleID)) {
            memberRoles.remove(role.roleID).then(() => {
              console.log(`Removed ${user.username} from the ${role.name} role`);
            }).catch(() => {
              console.log(`Oh no, there was an issue removing ${user.username} from the ${role.name} role`);
            });
          }
        });
      });
    }
  };
}
