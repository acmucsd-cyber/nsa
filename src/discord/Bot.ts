import {
  Client, Message, MessageEmbed, MessageReaction, User,
} from 'discord.js';
import roles from './roles';
import commands from './command-strings';
import { generateName } from './name-gen';
import * as functions from './functions';
import { channels } from '../config.json';

export default class Bot {
  private readonly client: Client;

  private readonly config: DiscordConfig;

  constructor(config: DiscordConfig) {
    this.client = new Client();
    this.config = config;
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
      console.log('A new member has joined');
      member.send(`Welcome to ACM Cyber's Discord! ACM Cyber is a community of all kinds of cybersecurity enthusiasts and hobbyists. In this server, we'll announce club activities and events, hold spontaneous discussions, post memes, and more! No experience is required to participate in ACM Cyber. To get started, read the rules in <#${channels.rules}> and react to the message. Once you introduce yourself in <#${channels.introductions}>, you'll have access to the full server!`)
        .catch(console.error);
    });

    this.client.on('message', this.messageHandle);

    this.client.on('messageReactionAdd', this.messageReactionAddHandle);
    this.client.on('messageReactionRemove', this.messageReactionRemoveHandle);
  }

  messageHandle = (message: Message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(this.config.prefix)) {
      if (message.channel.id === channels.introductions // Message is in the introductions channel
        && message.content.includes(' ') // Message is longer than one word
        && message.member // Person is real
        && !(message.member.roles.cache.has('742797850630684762'))) { // ID of "member" role
        console.log(`Gave member role to ${message.member.user.tag}`);
        message.member.roles.add('742797850630684762').then(() => {
          message.member.send(`Great! Get some roles over in <#${channels.roles}> to connect with others who share your interests and join the discussion in <#${channels.lobby}>!`).then(() => { }).catch(() => { });
        }).catch(() => { });
      }
    } else {
      const commandString = message.content.substr(this.config.prefix.length).trim().split(' ');
      const reply = new MessageEmbed()
        .setColor(8388608)
        .setTitle('NSA')
        .setURL('http://github.com/acmucsd-cyber/nsa')
        .setFooter("I'm Watching You 👁️");
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
          reply.addFields(commands.find((command) => command.name === commandString[0]).fields);
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
        default:
          reply.setDescription('Unknown command!');
      }

      message.channel.send(reply).then(() => {
        console.log('Response sent');
      }).catch(() => {
        console.log('Response not sent.');
      });
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
            }).catch(() => { });
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
            }).catch(() => { });
          }
        });
      });
    }
  };
}
