import { Client, Message, User, MessageEmbed } from 'discord.js'
import * as toolkit from './toolkit.json'
import * as roles from "./roles.json"
import {commands} from "./command-strings.json"
import { generateName } from './name-gen'
import * as functions from "./functions"
import { channels } from "../config.json"
export default class Bot {
	private readonly client: Client;
	private readonly config: DiscordConfig;

	constructor(config: DiscordConfig)
	{
		this.client = new Client();
		this.config = config;

	}
	public listen(): Promise <string> {
		this.client.on('message', (msg: Message) => {
			if (msg.author.bot) return;
			console.log("Recieved message: "+ msg.content);
			this.messageHandle(msg, this.config).then(() => {
				console.log("Response sent");
			}).catch(() => {
				console.log("Response not sent.");
			});
		});
		this.client.on('messageReactionAdd', async (reaction, user) => {
			if (user.bot) return;
			if (reaction.message.channel.id === channels.roles){ //Roles Channel ID
				const memberRoles = reaction.message.guild?.member(user.id)?.roles;
				Object.keys(roles.roles).forEach(category => {
					Object.keys(roles.roles[category]).forEach(id =>{
						if (id === reaction.emoji.id && !memberRoles.cache.some(role => role.id === roles.roles[category][id][0])){
							console.log(`Added ${user.username} to the ${roles.roles[category][id][1]} role`);
							memberRoles.add(roles.roles[category][id][0]);
						}
					})
				})
			}
		});
		this.client.on('messageReactionRemove', async (reaction, user) => {
			if (user.bot) return;
			if (reaction.message.channel.id === channels.roles){ //Roles Channel ID
				const memberRoles = reaction.message.guild?.member(user.id)?.roles;
				Object.keys(roles.roles).forEach(category => {
					Object.keys(roles.roles[category]).forEach(id =>{
						if (id === reaction.emoji.id && memberRoles.cache.some(role => role.id === roles.roles[category][id][0])){
							console.log(`Removed ${user.username} from the ${roles.roles[category][id][1]} role`);
							memberRoles.remove(roles.roles[category][id][0]);
						}
					})
				})
			}
		});
		this.client.on('guildMemberAdd', member => {
            console.log("A new member has joined");
            member.send(`Welcome to ACM Cyber's Discord! ACM Cyber is a community of all kinds of cybersecurity enthusiasts and hobbyists. In this server, we'll announce club activities and events, hold spontaneous discussions, post memes, and more! No experience is required to participate in ACM Cyber. To get started, read the rules in <#${channels.rules}> and react to the message. Once you introduce yourself in <#${channels.introductions}>, you'll have access to the full server!`)
                .catch(console.error);
		});
		return this.client.login(this.config.token);
	}
	private messageHandle(msg: Message, config: DiscordConfig): Promise<Message | Message[]>{
		if (!msg.content.startsWith(config.prefix)){
			// Ping Test
			if (msg.content === "ping")
            {
                console.log("Got a ping");
                return msg.reply("Pong!");
			} else {
				// Giving users server access once they type in the introductions channel.
				if(msg.channel.id === channels.introductions //Message is in the introductions channel
				&& msg.content.includes(' ') //Message is longer than one word
				&& msg.member !== null // just in case it is
				&& !(msg.member.roles.cache.has('742797850630684762'))) //ID of "member" role
                {
                    console.log("Gave member role to " + msg.member.user.tag);
					msg.member.roles.add('742797850630684762');
					msg.member.send(`Great! Get some roles over in <#${channels.roles}> to connect with others who share your interests and join the discussion in <#${channels.lobby}>!`)
				}
				//Unlikely chance for the bot to add an eye emote
				if (Math.random() < 0.01) {
					msg.react('👁')
				}
				return Promise.reject();
			}
		} else {
			const commandString = msg.content.substr(config.prefix.length).trim().split(' ');
			const reply = new MessageEmbed()
				.setColor(8388608)
				.setTitle("NSA")
				.setURL("http://github.com/acmucsd-cyber/nsa")
				.setFooter("I'm Watching You 👁️");
			
			switch (commandString[0].toLowerCase()) {
				case "toolkit":
				case "tk":
					functions.tk(commandString, reply);
          			break;
				case "name":
					reply.setDescription(`What about this name:\n **${generateName(commandString)}**`);
					break;
				case "help":
				case "gettingstarted":
				case "faq":
					reply.addFields(commands.find(command => command.name === commandString[0]).fields);
					break;
				case "resources":
					functions.resources(reply);
					break;
				case "roles":
					functions.Roles(msg, reply);
					break;
				case "roleremove":
					functions.roleremove(msg, commandString, reply);
					break;		
				default:
					reply.setDescription("Unknown command!");
			}
			return msg.channel.send(reply);
		}
	}

	public logInfo(info: string): void {
		console.log('[\x1b[36m%s\x1b[0m] %s', this.client.user.tag, info)
	}

	public connect(): void {
		// Confirms the connection to Discord
		console.log('Logged in as: ' + this.client.user.tag)
		this.client.user.setActivity('You', { type: 'WATCHING' });
	}

}
