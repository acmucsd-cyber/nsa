import * as roles from "./roles.json"
import { Message } from "discord.js"
import * as toolkit from './toolkit.json'
import * as command from "./command-strings.json"

export const Roles = (msg: Message) => {
    if (!(msg.member?.roles.cache.find(r => r.name === "Goon" || r.name === "Board" || r.name ==="Admin" || r.name === "Discord Bot Dev"))){
        return "Only Goons, Admins, Board, or Bot Devs can use this command. Check out [redacted for server safety] to get roles.";
    }
    if (msg.channel.id !== roles.channelID){ //ID of the roles channel
        return "Please only use this command in the roles channel!";
    }
    msg.channel.bulkDelete(10, true);
    Object.keys(roles.embeds).forEach(key => {
        msg.channel.send({ embed: roles.embeds[key] })
            .then((reactMessage) => {
                Object.keys(roles.roles[key]).forEach(emote => {
                    reactMessage.react(emote);
                })
            })
        })
    return `Roles last updated on  ${new Date().toString()}`;
}

export const roleremove = (msg: Message, commandString) => {
    if (commandString.length !== 2){
        return "Usage: ```-roleremove [role]```";
    }
    if (msg.member === null) {
        return "Cannot remove role. Make sure you are messaging me in any ACM Cyber channel and not in DM."
    }
    if(!msg.member.roles.cache.find(r => r.name.toLowerCase() === commandString[1])){
        return "You don't have that role.";
    }
    let message = "That role can't be removed, sorry. Ask a Goon or Admin to remove it for you.";
    Object.keys(roles.roles).forEach(category => {
        Object.keys(roles.roles[category]).forEach(id =>{
            if (roles.roles[category][id][1] === commandString[1]){
                msg.guild?.member(msg.member.user.id)?.roles.remove(roles.roles[category][id][0]);
                console.log(`Removed ${msg.member.user.username} from the ${roles.roles[category][id][1]} role`);
                message = `Removed you from the ${commandString[1]} role.`;
            }
        })
    });
    return message; 
}

export const tk = (commandString) => {
    if (Object.keys(toolkit).includes(commandString[1])) {
        return toolkit[commandString[1]].fields;
    } else {
        return command.toolkit.fields;
    }
}
