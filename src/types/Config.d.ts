declare interface Config {
    discord: DiscordConfig
}

declare interface DiscordConfig {
    token: string,      // your discord bot token, used to authenticate
    prefix: string      // the prefix this bot will look for before each command
}