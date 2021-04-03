const queue = require("../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function forceSkip(message) {
    if (!message.member.voice.channel){
      message.channel.send("You have to be in a voice channel to skip");
      return;
    }
    
    if (await queue.getServerSongCount(message.guild.id) <= 0){
      message.channel.send("There is no song that I could skip!");
      return;
    }       

    const connection = await queue.getConnection(message.guild.id);
    connection.dispatcher.end();
}

module.exports = {
    forceSkip
}