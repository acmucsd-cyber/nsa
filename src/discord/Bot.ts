import Discord, { Client, Message, User } from 'discord.js'
import * as toolkit from './toolkit.json'
import { generateName } from './name-gen'
import * as roles from "./roles.json"
import * as command from "./command-strings.json"

export default class Bot {
	private readonly client: Client;
	private readonly config: DiscordConfig;

	constructor(config: DiscordConfig)
	{
		this.client = new Discord.Client();
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
			if (reaction.message.channel.id === roles.channelID){ //Roles Channel ID
			  const memberRoles = reaction.message.guild?.member(user.id)?.roles;
			  const roleID = roles.roles[reaction.emoji.id][0];
			  if(roles.roles.hasOwnProperty(reaction.emoji.id) && !memberRoles.cache.some(role => role.id === roleID)){
				memberRoles.add(roleID);
			  }
			}
		});
		this.client.on('messageReactionRemove', async (reaction, user) => {
			if (reaction.message.channel.id === roles.channelID){ //Roles Channel ID
				const memberRoles = reaction.message.guild?.member(user.id)?.roles;
				const roleID = roles.roles[reaction.emoji.id][0];
				if(roles.roles.hasOwnProperty(reaction.emoji.id) && memberRoles.cache.some(role => role.id === roleID)){
					memberRoles.remove(roleID);
			  	}
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
				if(msg.channel.id === '742797435520417828' //Message is in the introductions channel
				&& msg.content.includes(' ') //Message is longer than one word
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
			const commandString: string[] = msg.content.substr(config.prefix.length).trim().split(' ');
			var reply = {embed :{color: command.generic.color, title: command.generic.title, url : command.generic.url, footer: command.generic.footer, description : "", fields : []}};
			switch (commandString[0].toLowerCase()) {
				case "toolkit":
				case "tk":
					let cat = commandString[1];
					let categories: string[] = Object.keys(toolkit);
					if (categories.includes(cat)) {
						reply["embed"]["fields"] = toolkit[cat].fields;
					} else {
						reply["embed"]["fields"] = command.toolkit.fields;
					}
          			break;
				case "name":
					reply["embed"]["description"] = `What about this name:\n **${generateName(commandString)}**`;
					break;
				case "help":
				case "gettingstarted":
				case "faq":
				case "resources":
					reply["embed"]["fields"] = command[commandString[0]].fields;
					break;
				case "roles":
					if (!(msg.member.roles.cache.find(r => r.name === "Goon" || r.name === "Board" || r.name ==="Admin" || r.name === "Discord Bot Dev"))){
						reply["embed"]["description"] = ("Only Goons, Admins, Board, or Bot Devs can use this command. Check out [redacted for server safety] to get roles.");
						break;
					}
					if (msg.channel.id !== roles.channelID){ //ID of the roles channel
						reply["embed"]["description"] = ("Please only use this command in the roles channel!");
						break;
					}
					msg.channel.bulkDelete(10, true);
					for (var i in roles.embeds){
						var text = roles.embeds[i];
						msg.channel.send({embed: text});
					}
					var d = new Date();
					reply["embed"]["description"] = "Roles last updated on " + d.toString();
					break;
				case "roleremove":
					if (commandString.length !== 2){
						reply["embed"]["description"] = "Usage: ```-roleremove [role]```";
						break;
					}
					if(!msg.member.roles.cache.find(r => r.name === commandString[1])){
						reply["embed"]["description"] = "You don't have that role.";
						break;
					}
					for (var key in roles.roles) { 
						if (roles.roles[key][1] === commandString[1]){
							msg.guild?.member(msg.member.user.id)?.roles.remove(roles.roles[key][0]);
							reply["embed"]["description"] = ("Removed you from the " + commandString[1] + " role.");
							break;
						} else{
							reply["embed"]["description"] = "That role can't be removed, sorry. Ask a Goon or Admin to remove it for you.";
						}
					}
					break;
				default:
					reply["embed"]["description"] = "Unknown command!";
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
		this.client.user.setActivity('you 👁', { type: 'WATCHING' });
	}

}
