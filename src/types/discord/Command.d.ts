import {ArgumentValue, Flag, Parameter} from 'discord/Argument'
import {Message} from "discord.js";

export default interface Command {
    readonly names: string[],
    readonly description: string
}

export interface CommandLeaf extends Command {
    readonly flags: Flag[],
    readonly parameters: Parameter[],
    readonly execute: (msg: Message, flags: ArgumentValue[], parameters: ArgumentValue[]) => void
}

export interface CommandTree extends Command {
    readonly subs: Command[]
}