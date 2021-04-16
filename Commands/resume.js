const dispatcherControls = require("../dispatcherControls")
const Discord = require("discord.js")

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function resume(message){
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel){
        message.channel.send("You need to be in a voice channel to pause the  music!");
        return;
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        message.channel.send("I need the permissions to join and speak in your voice channel!");
        return;
    }

    const result = await dispatcherControls.resume()
    if(typeof result == "string"){
        message.channel.send(result)
        return
    }
    else{
        message.channel.send("Resumed")
        return;
    }
}

module.exports = {
    resume
}