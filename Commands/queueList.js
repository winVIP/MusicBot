const ytdl = require("ytdl-core");
const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function queueList(message) {  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel){
      message.channel.send("You need to be in a voice channel to use this command!");
      return;
    }

    const songList = await queue.getSongList(message.guild.id);

    message.channel.send(songList);
}

module.exports = {
    queueList
}