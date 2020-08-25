import Discord, { Client, Message, User } from 'discord.js'
import * as toolkit from './toolkit.json'
import { generateName } from './name-gen'
import * as roles from "./roles.json"
import { CTF } from "./ctf"

export default class Bot {
	private readonly client: Client;
	private readonly config: DiscordConfig;
	private readonly ctf: CTF;
	// private checkingFlag = false;
	private checkingFlag = new Set<User>();

	constructor(config: DiscordConfig)
	{
		this.client = new Discord.Client();
		this.config = config;
		this.ctf = new CTF(config.flags);
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
			reaction.message.channel.send(reaction.emoji.id);
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

	private processCTFCommand(commandArgs: string[], invoker: User, msgReply: (msg: string) => void): string {
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

	private replyTemplate() {
		return {embed :{color: 0x800000, title:"NSA", url : "http://github.com/acmucsd-cyber/nsa", thumbnail: "",description : ""}};
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
			// var reply = {embed :{color: 0x800000, title:"NSA", url : "http://github.com/acmucsd-cyber/nsa", thumbnail: "",description : ""}};
			let reply = this.replyTemplate();
			switch (commandString[0].toLowerCase()) {
				case "toolkit":
				case "tk":
					let cat = commandString[1];
					let tools: string = "";
					let categories: string[] = Object.keys(toolkit);
					if (categories.includes(cat)) {
						Object.keys(toolkit[cat]).forEach(function(key) {
							tools += '\nTool : ' + toolkit[cat][key].name + '\nDescription : ' + toolkit[cat][key].description
								+ '\nurl: ' + toolkit[cat][key].url + '\n';
						});
						reply["embed"]["description"] = tools;
					} else {
						reply["embed"]["description"] = ("\nUsage: !toolkit [category] or !tk [category]\nRecommends toolkits for various CTF "
							+ "categories\n\nCategories:\nrev\t\t  Reverse Engineering\nweb\t\tWeb\ncrypto\tCryptography\n"
							+ "pentest  Pen Testing\nsteg\t\tSteganography\nforens\tForensics\nosint\t  OSINT\nnet\t\t Network");
					}
          			break;
				case "name":
					reply["embed"]["description"] = `What about this name:\n **${generateName(commandString)}**`;
					break;
				case "help":
					reply["embed"]["description"] = 'Hello! Welcome to ACM Cyber! Here are some help commands: \n\n- !Resources \n- !FAQ \n- !GettingStarted';
					break;
				case "gettingstarted":
					reply["embed"]["description"] = 'One of the best ways to get started is by learning the basics of CTFs. A great place to start would be picoCTF. Head to the channel #intro-resources and look at the pinned messages to get started.';
					break;
				case "faq":
					reply["embed"]["description"] = '\n\n\"What is the difference between ACM and ACM Cyber?\"\n\nACM is a chapter of the Association for Computing Machinery, a much larger community of students, developers, designers, and any industry professionals that uses computing in their daily lives. ACM Cyber is a sub-community of UC San Diego\'s ACM chapter, \
but we are our own organization and focus specifically on cybersecurity while still engaging with the greater ACM community and benefitting from their backing and support for our activities.\n\n\"Can I still join even if I don’t have any cybersecurity experience?\"\n\nYes! We welcome anyone and everyone of all skill levels, and we hope that by sticking around \
we can help you grow your own skillset and interests :)\n\n\"I want to compete in CTFs -- how do I join a team?\"\n\nAsk someone on discord to add you to the @Hacker role and\
  you\'ll get notifications for all upcoming events. The Competition Committee is working to finalize the details, but for now we\'re all on one big team, and we\'d love to have you!';
					break;
				case "resources":
					reply["embed"]["description"] = 'Head over to the <Cyber> sector of our discord for tons of resources!';
					break;
				case "roles":
					if (msg.channel.id !== roles.channelID){ //ID of the roles channel
						reply["embed"]["description"] = ("Please only use this command in the roles channel!");
					}
					if (!(msg.member.roles.cache.find(r => r.name === "Goon" || r.name === "Board" || r.name ==="Admin" || r.name === "Discord Bot Dev"))){
						reply["embed"]["description"] = ("Only Goons, Admins, Board, or Bot Devs can use this command");
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
					for (var key in roles.roles) { 
						if (roles.roles[key][1] === commandString[1]){
							msg.guild?.member(msg.member.user.id)?.roles.remove(roles.roles[key][0]);
							reply["embed"]["description"] = ("Removed you from the " + commandString[1] + " role.");
						} else{
							reply["embed"]["description"] = "You don't have that role.";
						}
					}
					break;
				case "ctf":
					reply["embed"]["description"] = this.processCTFCommand(commandString.slice(1), msg.author, (ctfReplyMsg) => {
						let ctfReply = this.replyTemplate();
						ctfReply["embed"]["description"] = ctfReplyMsg;
						msg.channel.send(ctfReply);
					});
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
