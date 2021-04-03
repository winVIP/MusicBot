const { play } = require("./play.js");
const queue = require("./../queue.js");
const Discord = require("discord.js");
const ytsr = require("ytsr");

let lastSearch = undefined;

/**
 * 
 * @param {Discord.Message} message 
 * @param {Boolean} ignoreMaxUserSongs 
 */
async function search(message, ignoreMaxUserSongs){
    const query = message.content.trim().slice(8).trim()
    if(Number.isNaN(Number(query)) == true || Number.isInteger(Number(query)) == false){
        find(message, ignoreMaxUserSongs)
    }
    else{
        choose(message, ignoreMaxUserSongs)
    }
}

/**
 * 
 * @param {Discord.Message} message
 * @returns 
 */
async function find(message){
    const query = message.content.trim().slice(8).trim()

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

    const searchResults = await ytsr(query, {limit:10});
    if(searchResults.items.length == 0){
        message.channel.send("Couldn't find any songs with this query");
        return
    }
    lastSearch = searchResults;
    const titles = searchResults.items.map(item => item.title);
    const resultMessage = [];
    resultMessage.push("Choose a song to play:");
    for (let i = 0; i < titles.length; i++) {
        resultMessage.push(`${i + 1}. ` + titles[i]);    
    }
    message.channel.send(resultMessage);
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {Boolean} ignoreMaxUserSongs 
 */
async function choose(message, ignoreMaxUserSongs){
    const query = Number(message.content.trim().slice(8).trim()) - 1

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
        const addResult = await queue.addSong(message.channel, voiceChannel, lastSearch.items[query].url, message.guild.id, message.member.id, ignoreMaxUserSongs);
        if(typeof addResult == "string"){
          message.channel.send(addResult);
          return;
        }
    
        try {
          var connection = await voiceChannel.join();
          const connectionResult = await queue.addConnection(message.guild.id, connection);
          play(message, ignoreMaxUserSongs);
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
        const addResult = await queue.addSong(message.channel, voiceChannel, lastSearch.items[query].url, message.guild.id, message.member.id, ignoreMaxUserSongs);
        if(typeof addResult == "string"){
          message.channel.send(addResult);
          return;
        }
        const userSongsCount = await queue.getUserSongCount(message.guild.id, message.member.id);
        const serverSongCount = await queue.getServerSongCount(message.guild.id);
    
        const serverSettings = require("../ServerSettings/" + message.guild.id + ".json");
        const maxUserSongs = serverSettings["maxUserSongs"];
        const maxServerSongs = serverSettings["maxQueueSize"];
    
        const songTitle = addResult.title;
    
        let songAddedToQueueMessage = `**${songTitle}** has been added to the queue!`;
        if(maxUserSongs > 0 && ignoreMaxUserSongs == false){
          songAddedToQueueMessage = songAddedToQueueMessage + `\nYou have added **${userSongsCount}/${maxUserSongs}**`;
        }
        if(maxServerSongs > 0){
          songAddedToQueueMessage = songAddedToQueueMessage + `\nServer queue **${serverSongCount}/${maxServerSongs}**`;
        }
    
        message.channel.send(songAddedToQueueMessage);
        return;
      }
}

module.exports = {
    search
}