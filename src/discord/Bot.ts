import {
  Client, GuildMember, Message, MessageEmbed, MessageReaction, User,
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
    this.client.on('guildMemberAdd', this.memberAddHandle);

    this.client.on('message', this.messageHandle);
    this.client.on('messageReactionAdd', this.messageReactionAddHandle);
    this.client.on('messageReactionRemove', this.messageReactionRemoveHandle);
  }

  memberAddHandle = async (member: GuildMember) => {
    if (member.user.bot) return;

    console.log('A new member has joined');
    await member.send(`Welcome to ACM Cyber! We’re excited to have you with us during our first year as a student organization.\n Our three pillars (Learn, Practice, and Participate) drive our decisions as a club and the events we hold. As you know, we host technical events to introduce our members to various concepts in cybersecurity and industry panels to form connections with the greater computing community. We are always open for feedback for workshops and any ideas for events we can hold! If you have an idea about an event you’d like to see come to fruition, pitch it in the Ideas channel! This channel is for you to voice your opinion about anything you would like to see! Whether you would like to teach a workshop yourself or have us hold a workshop on this topic, please let us know through this channel! \n **First, however, please read the rules in <#${channels.rules}> and introduce yourself in <#${channels.introductions}> to gain access to the rest of the server.**`)
  }

  messageHandle = async (message: Message) => {
    if (message.author.bot) return;

    try {
      if (!message.content.startsWith(this.config.prefix)) {
        if (message.channel.id === channels.introductions // Message is in the introductions channel
          && message.content.includes(' ') // Message is longer than one word
          && message.member // Person is real
          && !(message.member.roles.cache.has('742797850630684762'))) { // ID of "member" role
          await message.member.roles.add('742797850630684762');
          console.log(`Gave member role to ${message.member.user.tag}`);
          await message.member.send(`Great! Get some roles over in <#${channels.roles}> to connect with others who share your interests and join the discussion in <#${channels.lobby}>!`);
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
            reply.addFields(commands.find((command) => command.name === commandString[0].toLowerCase()).fields);
            break;
          case 'resources':
            functions.resources(reply);
            break;
          case 'roles':
            functions.Roles(message, reply);
            break;
          case 'roleremove':
            await functions.roleremove(message, commandString, reply);
            break;
          default:
            reply.setDescription('Unknown command!');
        }

        await message.channel.send(reply);
        console.log('Response sent');
      }
    } catch (e) {
      await message.channel.send(e);
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
