const ytdl = require("ytdl-core");
const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * Clears the song queue
 * @param {Discord.Message} message that was sent by the user
 * @returns 
 */
async function clear(message) {  
    //The voice channel of the user that sent the message
    const voiceChannel = message.member.voice.channel;
    //Checks if the user is in a voice channel
    if (!voiceChannel){
      message.channel.send("You need to be in a voice channel to use this command!");
      return;
    }

    //Clears the song queue
    queue.clearQueue(message.guild.id);

    message.channel.send("The queue was cleared");
}

module.exports = {
    clear
}