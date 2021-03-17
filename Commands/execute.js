const ytdl = require("ytdl-core");
const { play } = require("./play.js");
const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function execute(message) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel){
      message.channel.send("You need to be in a voice channel to play music!");
      return;
    }
      
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      message.channel.send("I need the permissions to join and speak in your voice channel!");
      return;
    }
  
    if (await queue.isEmpty(message.guild.id) == true) {
      await queue.addSong(message.channel, voiceChannel, args[1], message.guild.id, message.member.id);

      try {
        var connection = await voiceChannel.join();
        const connectionResult = await queue.addConnection(message.guild.id, connection);
        play(message);
        return;
      } 
      catch (err) {
        console.log(err);
        await queue.clearQueue(message.guild.id);
        message.channel.send(err);
        return;
      }
    } 
    else {
      const addResult = await queue.addSong(message.channel, voiceChannel, args[1], message.guild.id, message.member.id);
      if(addResult == "Queue is full"){
        message.channel.send("Queue is full");
        return;
      }
      if(addResult == "You have reached the maximum amount of song that a user can add to the queue"){
        message.channel.send("You have reached the maximum amount of songs that a user can add to the queue");
        return;
      }
      const userSongsCount = await queue.getUserSongCount(message.guild.id, message.member.id);
      const serverSongCount = await queue.getServerSongCount(message.guild.id);

      const serverSettings = require("../ServerSettings/" + message.guild.id + ".json");
      const maxUserSongs = serverSettings["maxUserSongs"];
      const maxServerSongs = serverSettings["maxQueueSize"];

      const songTitle = addResult.title;

      message.channel.send(`**${songTitle}** has been added to the queue!\nYou have added **${userSongsCount}/${maxUserSongs}**\nServer queue **${serverSongCount}/${maxServerSongs}**`);
      return;
    }
}

module.exports = {
    execute
}