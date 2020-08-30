import {roles} from "./roles.json"
import { Message, MessageEmbed } from "discord.js"
import * as toolkit from './toolkit.json'
import {commands} from "./command-strings.json"
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
    let roleCat = new MessageEmbed; 
    roles.forEach(category => {
        roleCat = new MessageEmbed()
            .setColor(8388608);
        roleCat.setTitle(category.category);
        category.roles.forEach(role => {
            roleCat.addField(role.name, `<:${role.name.toLowerCase().replace('-', '')}:${role.emoteID}>`);
        });
        msg.channel.send(roleCat)
            .then(reactMessage => {
                category.roles.forEach(role => {
                    reactMessage.react(role.emoteID);
                })
            })
    });
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
    roles.forEach(category => {
        if(category.roles.some(r => r.name.toLowerCase() === commandString[1])){
            msg.guild?.member(msg.member.user.id)?.roles.remove(category.roles.find(role => role.name.toLowerCase() === commandString[1]).roleID);
            console.log(`Removed ${msg.member.user.username} from the ${commandString[1].toLowerCase()} role`);
            message = `Removed you from the ${commandString[1].toLowerCase()} role.`;
        }
    })
    $embed.setDescription(message);
    return; 
}

export const tk = (commandString: string[], $embed: MessageEmbed) => {
    if (Object.keys(toolkit).includes(commandString[1])) {
        $embed.addFields(toolkit[commandString[1]].fields);
    } else {
        $embed.addFields(commands.find(command => command.name === "toolkit").fields);
    }
    return;
}

export const resources = ($embed: MessageEmbed) => {
    let content = "";
    channels.categories.forEach(category => {
        content="";
        category.channels.forEach(id => {
            content += `<#${id}>\n`
        });
        $embed.addField(category.name, content);
    })
    return;
}