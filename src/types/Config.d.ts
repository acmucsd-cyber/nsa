declare interface Config {
    discord: DiscordConfig
}

declare interface DiscordConfig {
    token: string,      // your discord bot token, used to authenticate
    prefix: string,     // the prefix this bot will look for before each command
    flags: Flags        // where mini-CTF flags will be stored 
}

declare interface Flags { // format: "flags": {"challenge_name": "nsa{l33t-str1ng}", ...}
    example_challenge: string,
    challenge_2: string
}
