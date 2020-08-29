import * as roles from "./roles.json"
import { Message, MessageEmbed } from "discord.js"
import * as toolkit from './toolkit.json'
import * as command from "./command-strings.json"
import {channels} from "../config.json"

export const Roles = (msg: Message, $embed: MessageEmbed) => {
    if (!(msg.member?.roles.cache.find(r => r.name === "Goon" || r.name === "Board" || r.name ==="Admin" || r.name === "Discord Bot Dev"))){
        $embed.setDescription(`Only Goons, Admins, Board, or Bot Devs can use this command. Check out <#${channels.roles}> to get roles.`);
        return;
    }
    if (msg.channel.id !== channels.roles){ //ID of the roles channel
        $embed.setDescription("Please only use this command in the roles channel!");
        return;
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
    $embed.setDescription(`Roles last updated on  ${new Date().toString()}`);
    return;
}

export const roleremove = (msg: Message, commandString: string[], $embed: MessageEmbed) => {
    if (commandString.length !== 2){
        $embed.setDescription("Usage: ```-roleremove [role]```");
        return;
    }
    if (msg.member === null) {
        $embed.setDescription("Cannot remove role. Make sure you are messaging me in any ACM Cyber channel and not in DM.");
        return;
    }
    if(!msg.member.roles.cache.find(r => r.name.toLowerCase() === commandString[1])){
        $embed.setDescription("You don't have that role.");
        return;
    }
    let message = "That role can't be removed, sorry. Ask a Goon or Admin to remove it for you.";
    Object.keys(roles.roles).forEach(category => {
        Object.keys(roles.roles[category]).forEach(id =>{
            if (roles.roles[category][id][1] === commandString[1]){
                msg.guild?.member(msg.member.user.id)?.roles.remove(roles.roles[category][id][0]);
                console.log(`Removed ${msg.member.user.username} from the ${roles.roles[category][id][1]} role`);
                message = `Removed you from the ${commandString[1]} role.`;
            }
        });
    });
    $embed.setDescription(message);
    return; 
}

export const tk = (commandString: string[], $embed: MessageEmbed) => {
    if (Object.keys(toolkit).includes(commandString[1])) {
        toolkit[commandString[1]].fields.forEach(field => {
            $embed.addField(field.name, field.value);
        });
    } else {
        command.toolkit.fields.forEach(field => {
            $embed.addField(field.name, field.value);
        });
    }
    return;
}

export const resources = ($embed: MessageEmbed) => {
    let content = "";
    channels.categories.forEach(category => {
        content="";
        category.channels.forEach( id => {
            content += `<#${id}>\n`
        })
        $embed.addField(category.name, content);
    })
    return;
}