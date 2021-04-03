const Discord = require("discord.js")
const queue = require("../queue")
const playlists = require("../playlists");
const playCommand = require("./play.js");
const ytdl = require("ytdl-core");

/**
 * 
 * @param {Discord.Message} message 
 */
async function Playlist(message, ignoreMaxUserSongs){
    if(/^!playlist play [A-Za-z]+$/.test(message.content.trim()) == true){
        play(message, ignoreMaxUserSongs);
        return;
    }
    else if(/^!playlist play [A-Za-z]+ [0-9]+$/.test(message.content.trim()) == true){
        playOne(message, ignoreMaxUserSongs);
        return;
    }
    else if(/^!playlist create [A-Za-z]+$/.test(message.content.trim()) == true){
        create(message);
        return;
    }
    else if(/^!playlist add [A-Za-z]+/.test(message.content.trim()) == true){
        add(message);
        return;
    }
    else if(/^!playlist delete [A-Za-z]+$/.test(message.content.trim()) == true){
        deletePlaylist(message);
        return;
    }
    else if(/^!playlist remove [A-Za-z]+ [0-9]+$/.test(message.content.trim()) == true){
        remove(message);
        return;
    }
    else if(/^!playlist all$/.test(message.content.trim()) == true){
        getPlaylistNames(message);
        return;
    }
    else if(/^!playlist [A-Za-z]+$/.test(message.content.trim()) == true){
        getSongs(message);
        return;
    }
    else {
        message.channel.send("You need to enter a valid command!");
        return;
    }
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function play(message, ignoreMaxUserSongs){
    const playlistName = message.content.trim().slice(15).trim();

    const urls = await playlists.getPlaylist(message.guild.id, playlistName);

    for (let i = 0; i < urls.length; i++) {
        await execute(message, urls[i], ignoreMaxUserSongs)
    }
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {String} url 
 * @param {Boolean} ignoreMaxUserSongs 
 * @returns 
 */
async function execute(message, url, ignoreMaxUserSongs){
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
        const addResult = await queue.addSong(message.channel, voiceChannel, url, message.guild.id, message.member.id, ignoreMaxUserSongs);
        if(typeof addResult == "string"){
          message.channel.send(addResult);
          return;
        }
  
        try {
          var connection = await voiceChannel.join();
          const connectionResult = await queue.addConnection(message.guild.id, connection);
          await playCommand.play(message, ignoreMaxUserSongs);
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
        const addResult = await queue.addSong(message.channel, voiceChannel, url, message.guild.id, message.member.id, ignoreMaxUserSongs);
        if(typeof addResult == "string"){
          message.channel.send(addResult);
          return;
        }
        return;
      }
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function playOne(message, ignoreMaxUserSongs){
    const playlistNameAndIndex = message.content.trim().slice(15).trim();
    const playlistName = playlistNameAndIndex.split(" ")[0];
    const index = Number(playlistNameAndIndex.split(" ")[1]) - 1;
    const urls = await playlists.getPlaylist(message.guild.id, playlistName);
    await execute(message, urls[index], ignoreMaxUserSongs)
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function create(message){
    const playlistName = message.content.trim().slice(17).trim();
    const result = await playlists.addPlaylist(message.guild.id, playlistName);
    message.channel.send(result)
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function add(message){
    const playlistNameAndURL = message.content.trim().slice(14).trim();
    const playlistName = playlistNameAndURL.split(" ")[0];
    const url = playlistNameAndURL.split(" ")[1];
    const result = await playlists.addSong(message.guild.id, playlistName, url);
    message.channel.send(result)
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function deletePlaylist(message){
    const playlistName = message.content.trim().slice(17).trim();
    const result = await playlists.deletePlaylist(message.guild.id, playlistName);
    message.channel.send(result)
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function remove(message){
    const playlistNameAndIndex = message.content.trim().slice(17).trim();
    const playlistName = playlistNameAndIndex.split(" ")[0];
    const index = Number(playlistNameAndIndex.split(" ")[1]) - 1;
    const result = await playlists.removeSong(message.guild.id, playlistName, index);
    message.channel.send(result)
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function getSongs(message){
    const playlistName = message.content.trim().slice(10).trim();
    const playlistURLS = await playlists.getPlaylist(message.guild.id, playlistName);
    const result = []
    result.push(`Playlist ${playlistName}:`)
    for (let i = 0; i < playlistURLS.length; i++) {
        const videoInfo = await ytdl.getBasicInfo(playlistURLS[i]);
        result.push(`**${(i + 1)}**` + ". " + videoInfo.videoDetails.title)
    }
    message.channel.send(result)
    return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function getPlaylistNames(message){
    const playlistNames = await playlists.getAllPlaylistNames(message.guild.id);
    const result = []
    result.push(`Available playlists on this server:`)
    for (let i = 0; i < playlistNames.length; i++) {
        result.push(`**${(i + 1)}**` + ". " + playlistNames[i])
    }
    message.channel.send(result)
    return;
}

module.exports = {
    Playlist
}