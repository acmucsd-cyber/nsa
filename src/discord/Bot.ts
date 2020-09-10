import {
  Client, Message, MessageEmbed, MessageReaction, User,
} from 'discord.js';
import roles from './roles';
import commands from './command-strings';
import { generateName } from './name-gen';
import * as functions from './functions';
import { channels, challenges } from '../config.json';

export default class Bot {
  private readonly client: Client;

  private readonly config: DiscordConfig;

  public checkingFlag: Set<User>;

  private flags: Map<string, Buffer>;

  constructor(config: DiscordConfig) {
    this.client = new Client();
    this.config = config;
    this.checkingFlag = new Set<User>();
    this.flags = new Map<string, Buffer>();
    challenges.forEach((challenge: Challenge) => {
      this.flags.set(challenge.name, Buffer.from(challenge.flag));
    });
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

  getFlag = (challengeName: string) => this.flags.get(challengeName);

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
      const reply = new MessageEmbed();
      functions.formatEmbed(reply);
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
        case 'flag':
          if (commandString.length === 1) {
            reply.addFields(commands.find((command) => command.name === 'flag').fields);
            break;
          }
          if (!this.flags.has(commandString[1].toLowerCase())) {
            reply.setDescription('Error: Invalid challenge');
            break;
          }
          functions.flag(this.checkingFlag, this.getFlag(commandString[1].toLowerCase()), commandString, message, reply);
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
