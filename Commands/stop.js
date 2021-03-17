const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function stop(message) {
    if (!message.member.voice.channel){
      message.channel.send("You have to be in a voice channel to stop the music!");
      return;
    }
    const connection = await queue.getConnection(message.guild.id);
    queue.clearQueue(message.guild.id);
    connection.dispatcher.end();
}

module.exports = {
    stop
}