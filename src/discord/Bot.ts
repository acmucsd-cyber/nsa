import Discord, { Client, Message, User } from 'discord.js'

export default class Bot {

	constructor(
		private readonly config: DiscordConfig,
		private readonly client: Client = new Discord.Client()
	) {
		this.client.on('message', (msg: Message) => this.messageHandler.bind(this)(msg))
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
			
		}
		//Ping Test
		this.client.on("ready", () =>
		{
			console.log('Logged in as ${client.user.tag}!')
		})
	
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
			member.send("Welcome to the ACM Cyber server! Get your roles in #roles. Once you introduce yourself in #introductions, you'll have access to the full ACM Cyber Server!")
				.catch(console.error);
		})
		//Giving users server access once they type in the introductions channel. Need to give the bot "manage roles" perms.
		this.client.on("message", msg =>
		{
			if(msg.channel.id === '742797435520417828') //ID of introductions channel
			{
				if (msg.content.includes(' '))
				{
					if(!(msg.member.roles.cache.has('742797850630684762'))) //ID of "verified" role
					{
						console.log("addrole")
						msg.member.roles.add('742797850630684762')
					}
				}
			}
		})
	}

	public connect(): void {

		// connect to Discord
		this.client.login(this.config.token).then(() => {
			console.log('Logged in as: ' + this.client.user.tag)
			this.client.user.setActivity('you 👁', { type: 'WATCHING' })
		})
	}

}
