declare interface Config {
    discord: DiscordConfig,
    channels: Channels
}

declare interface DiscordConfig {
    token: string,          // your discord bot token, used to authenticate
    prefix: string          // the prefix this bot will look for before each command
}

declare interface Channels {
    roles: string,          //ID of the guild's roles channel
    rules: string,          //ID of the guild's rules channel
    introductions: string,  //ID of the guild's introductions channel
    lobby: string,          //ID of the guild's lobby or general channel
    categories: Category[]  //An array of categories you wish to be displayed in the resources command
}

declare interface Category{
    name: string,           //The name for the category of channels
    channels: string[]      //An array of all of the IDs of channels (of the desired category) you wish to include in the message
}