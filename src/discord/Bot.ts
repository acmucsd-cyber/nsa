import Discord, { Client, Message, User } from 'discord.js'
import * as toolkit from './toolkit.json'

export default class Bot {

	constructor(
		private readonly config: DiscordConfig,
		private readonly client: Client = new Discord.Client()
	) {
		this.client.on('message', (msg: Message) => this.messageHandler.bind(this)(msg))
		//Ping Test
		this.client.on("message", msg =>
        	{
            		if (msg.content === "ping")
            		{
                		console.log("got a ping")
                		msg.reply("Pong!")
            		}
        	})
        	//Sending new users a welcome DM
        	this.client.on('guildMemberAdd', member =>
        	{
            		console.log("new member")
            		member.send("Welcome to ACM Cyber's Discord! ACM Cyber is an ACM sub-org and community of all kinds of cybersecurity enthusiasts and hobbyists. This Discord server is our virtual home and a hub for our members -- it's where we will announce club activities and events, hold spontaneous discussions, post memes, and more! We welcome everyone from all skill levels and backgrounds. Read the rules in #rulesandinfo and once you introduce yourself in #introductions, you'll have access to the full server! Get your roles over in #roles, and join the discussion in #lobby!")
                		.catch(console.error);
        	})
        	//Giving users server access once they type in the introductions channel. Need to give the bot "manage roles" perms.
        	this.client.on("message", msg =>
        	{
            		if(msg.channel.id === '742797435520417828') //ID of introductions channel
            		{
                		if (msg.content.includes(' '))
                		{
                    			if(!(msg.member.roles.cache.has('742797850630684762'))) //ID of "member" role
                    			{
                        			console.log("addrole")
                        			msg.member.roles.add('742797850630684762')
                    			}
                		}
            		}
        	})
	}

	public logInfo(info: string): void {
		console.log('[\x1b[36m%s\x1b[0m] %s', this.client.user.tag, info)
	}

	private messageHandler(msg: Message): void {

		if (msg.author.bot) {
			return
		}

		if (Math.random() < 0.01) {
			msg.react('👁')
		}

		const prefix: string = [this.client.user.toString(), this.config.prefix]
			.find((prefix) => msg.content.startsWith(prefix))

		if (prefix) {
			const commandString: string[] = msg.content.substr(prefix.length).trim().split(' ')

			// process commands here
			if (commandString[0] === "ping")
			{
					console.log("got a ping")
					msg.reply("Pong!")
			}
			else if (commandString[0] === "toolkit" || commandString[0] === "tk")
			{
					let tools: string = ""
					if (commandString[1] === "rev")
					{
						Object.keys(toolkit.rev).forEach(function(key) {
  						tools += '\nTool : ' + toolkit.rev[key].name + '\nDescription : ' + toolkit.rev[key].description
								+ '\nurl: ' + toolkit.rev[key].url + '\n'
							})
						msg.reply(tools)
					}
					else if (commandString[1] === "pwn")
					{
						msg.reply("ok")
					}
					else if (commandString[1] === "crypto")
					{
						msg.reply("ok")
					}
					else if (commandString[1] === "steg")
					{
						msg.reply("ok")
					}
					else if (commandString[1] === "forens")
					{
						msg.reply("ok")
					}
					else if (commandString[1] === "web")
					{
						msg.reply("ok")
					}
					else if (commandString[1] === "osint")
					{
						msg.reply("ok")
					}
					else if (commandString[1] === "net")
					{
						msg.reply("ok")
					}
					else
					{
						msg.reply("<help message>")
					}
			}
		}
	}

	public connect(): void {

		// connect to Discord
		this.client.login(this.config.token).then(() => {
			console.log('Logged in as: ' + this.client.user.tag)
			this.client.user.setActivity('you 👁', { type: 'WATCHING' })
		})
	}

}
