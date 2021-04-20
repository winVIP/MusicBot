const queue = require("../queue.js");
const Discord = require("discord.js");

/**
 * Skips the song even if vote skip is enabled
 * @param {Discord.Message} message that was sent by the user
 * @returns 
 */
async function forceSkip(message) {
  //Checks if the user is in a voice channel
  if (!message.member.voice.channel){
    message.channel.send("You have to be in a voice channel to skip");
    return;
  }
  
  //Checks if there are any songs to skip
  if (await queue.getServerSongCount(message.guild.id) <= 0){
    message.channel.send("There is no song that I could skip!");
    return;
  }       

  //Skips the song
  const connection = await queue.getConnection(message.guild.id);
  connection.dispatcher.end();
}

module.exports = {
    forceSkip
}