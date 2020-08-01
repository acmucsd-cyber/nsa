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
	}

	public connect(): void {

		// connect to Discord
		this.client.login(this.config.token).then(() => {
			console.log('Logged in as: ' + this.client.user.tag)
			this.client.user.setActivity('you 👁', { type: 'WATCHING' })
		})
	}

}