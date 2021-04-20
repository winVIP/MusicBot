const queue = require("../queue.js");
const Discord = require("discord.js");
const botConfig = require("../config.json")

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function skipTo(message) {
    if (!message.member.voice.channel){
      message.channel.send("You have to be in a voice channel to stop the music!");
      return;
    }
    
    if (await queue.getServerSongCount(message.guild.id) <= 0){
      message.channel.send("There is no song that I could skip to!");
      return;
    }

    const re1 = new RegExp(`/^${botConfig.prefix}skipTo [0-9]+/`)
    if(re1.test(message.content.trim()) == false){
        message.channel.send("The command must be written in this format:\n**!skipTo [integer]**");
        return;
    }

    const index = Number(message.content.trim().slice(8));

    for (let i = 0; i < index - 2; i++) {
        await queue.removeSong(2, message.guild.id);
    }

    const connection = await queue.getConnection(message.guild.id);
    connection.dispatcher.end();
}

module.exports = {
    skipTo
}