import { Client, Message, User } from 'discord.js'
import * as toolkit from './toolkit.json'
import * as roles from "./roles.json"
import * as command from "./command-strings.json"
import { generateName } from './name-gen'
import * as functions from "./functions"
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
			if (reaction.message.channel.id === roles.channelID){ //Roles Channel ID
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
			if (reaction.message.channel.id === roles.channelID){ //Roles Channel ID
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
            member.send("Welcome to ACM Cyber's Discord! ACM Cyber is a community of all kinds of cybersecurity enthusiasts and hobbyists. In this server, we'll announce club activities and events, hold spontaneous discussions, post memes, and more! No experience is required to join ACM Cyber. To get started, read the rules in #rulesandinfo(and react to the message) and once you introduce yourself in #introductions, you'll have access to the full server! Get your roles over in #roles, and join the discussion in #lobby!")
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
				if(msg.channel.id === roles.channelID //Message is in the introductions channel
				&& msg.content.includes(' ') //Message is longer than one word
				&& msg.member !== null // just in case it is
				&& !(msg.member.roles.cache.has('742797850630684762'))) //ID of "member" role
                {
                    console.log("Gave member role to " + msg.member.user.tag);
					msg.member.roles.add('742797850630684762');
				}
				//Unlikely chance for the bot to add an eye emote
				if (Math.random() < 0.01) {
					msg.react('👁')
				}
				return Promise.reject();
			}
		} else {
			const commandString = msg.content.substr(config.prefix.length).trim().split(' ');
			const reply = {embed :{color: command.generic.color, title: command.generic.title, url : command.generic.url, footer: command.generic.footer, description : "", fields : []}};
			switch (commandString[0].toLowerCase()) {
				case "toolkit":
				case "tk":
					reply.embed.fields = functions.tk(commandString);
          			break;
				case "name":
					reply.embed.description = `What about this name:\n **${generateName(commandString)}**`;
					break;
				case "help":
				case "gettingstarted":
				case "faq":
				case "resources":
					reply.embed.fields = command[commandString[0]].fields;
					break;
				case "roles":
					reply.embed.description = functions.Roles(msg);
					break;
				case "roleremove":
					reply.embed.description = functions.roleremove(msg, commandString);
					break;		
				default:
					reply.embed.description = "Unknown command!";
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
