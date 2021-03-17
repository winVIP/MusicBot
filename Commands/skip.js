const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function skip(message) {
  const guildConfig = require("../ServerSettings/" + message.guild.id + ".json");
  let usersInChannel = 0;

  if (!message.member.voice.channel){
    message.channel.send("You have to be in a voice channel to stop the music!");
    return;
  }

  if (queue.getServerSongCount(message.guild.id) <= 0){
    message.channel.send("There is no song that I could skip!");
    return;
  }    

  if(message.member.voice.channel){
    usersInChannel = message.member.voice.channel.members.size - 1;
  }    

  const voteSkipResult = await queue.voteSkip(message.guild.id, message.member.id, usersInChannel);
  console.log("voteSkipResult: " + voteSkipResult)
  if(voteSkipResult == "skip"){
    const connection = await queue.getConnection(message.guild.id);
    connection.dispatcher.end();
    return;
  }
  else if(voteSkipResult == "sameUser"){
    message.channel.send("You already voted to skip");
    return;
  }
  else{
    let usersNeededToSkipCount = usersInChannel / 100 * guildConfig.usersNeededToSkip;
    usersNeededToSkipCount = Math.ceil(usersNeededToSkipCount);
    message.channel.send(`${voteSkipResult}/${usersNeededToSkipCount} want to skip`);
    return;
  }
}

module.exports = {
    skip
}