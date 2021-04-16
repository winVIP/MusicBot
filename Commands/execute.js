const Discord = require("discord.js");
const validUrl = require("valid-url")
const ytsr = require("ytsr");
const scdl = require("soundcloud-downloader").default;

const spotifyAPI = require("../spotifyAPI");
const { play } = require("./play.js");
const queue = require("./../queue.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function execute(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()
  if(validUrl.isUri(query) != undefined){
    if(scdl.isValidUrl(query) == true){
      isSoundCloudURL(message, ignoreMaxUserSongs)
    }
    else if(query.includes("spotify") == true){
      isSpotifyUrl(message, ignoreMaxUserSongs)
    }
    else{
      isUrl(message, ignoreMaxUserSongs)
    }
  }
  else{
    isQuery(message, ignoreMaxUserSongs)
  }
}

async function isSoundCloudURL(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()

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

  let scURLs = [];
  if(scdl.isPlaylistURL(query) == true){
    const info = await scdl.getSetInfo(query);
    scURLs = info.tracks
  }
  else{
    const info = await scdl.getInfo(query);
    scURLs.push(info);
  }

  if (await queue.isEmpty(message.guild.id) == true) {
    const addResult = await queue.addSoundCloudSongs(message.channel, voiceChannel, scURLs, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    const addResult = await queue.addSoundCloudSongs(message.channel, voiceChannel, scURLs, message.guild.id, message.member.id, ignoreMaxUserSongs);
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

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function isSpotifyUrl(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()

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

  const spotifyResults = await spotifyAPI.getQueries(query);
  console.log(spotifyResults)
  if(spotifyAPI == false){
    console.log(spotifyResults)
    message.channel.send("The spotify link isn't valid");
    return;
  }

  if (await queue.isEmpty(message.guild.id) == true) {
    const addResult = await queue.addSpotifySongs(message.channel, voiceChannel, spotifyResults, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    const addResult = await queue.addSong(message.channel, voiceChannel, spotifyResults, message.guild.id, message.member.id, ignoreMaxUserSongs);
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


/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function isUrl(message, ignoreMaxUserSongs) {
  const query = message.content.trim().slice(6).trim()

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
    const addResult = await queue.addSong(message.channel, voiceChannel, query, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    const addResult = await queue.addSong(message.channel, voiceChannel, query, message.guild.id, message.member.id, ignoreMaxUserSongs);
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

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function isQuery(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()

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

  const searchResults = await ytsr(query, {limit:1});
  if(searchResults.items.length == 0){
    message.channel.send("Couldn't find any songs with this query");
    return
  }
  const url = searchResults.items[0].url;

  if (await queue.isEmpty(message.guild.id) == true) {
    const addResult = await queue.addSong(message.channel, voiceChannel, url, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    const addResult = await queue.addSong(message.channel, voiceChannel, url, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    execute
}