const Discord = require("discord.js");
const validUrl = require("valid-url")
const ytsr = require("ytsr");
const scdl = require("soundcloud-downloader").default;

const spotifyAPI = require("../spotifyAPI");
const { play } = require("./play.js");
const queue = require("./../queue.js");

/**
 * If the play command is called redirects to one of execution functions
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function execute(message, ignoreMaxUserSongs){
  //Extracts the only the query from the full message
  const query = message.content.trim().slice(6).trim()
  //Checks whether the query is plain text or if it is a url from one of the platforms
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

/**
 * Execution function for SoundCloud
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function isSoundCloudURL(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()

  const voiceChannel = message.member.voice.channel;
  //Checks if the user is in a voice channel
  if (!voiceChannel){
    message.channel.send("You need to be in a voice channel to play music!");
    return;
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  //Checks if the bot has the permissions to connect to the voice channel and play audio in it
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    message.channel.send("I need the permissions to join and speak in your voice channel!");
    return;
  }

  let scURLs = [];
  //Checks if the link is a playlist URL or a track URL
  if(scdl.isPlaylistURL(query) == true){
    const info = await scdl.getSetInfo(query);
    scURLs = info.tracks
  }
  else{
    const info = await scdl.getInfo(query);
    scURLs.push(info);
  }

  //Checks if the queue is not initialized, if not it initializes and adds the song to the queue, otherwise just add the song to queue
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
 * Execution function for Spotify
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function isSpotifyUrl(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()

  //Checks if the user is in a voice channel
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel){
    message.channel.send("You need to be in a voice channel to play music!");
    return;
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  //Checks if the bot has the permissions to connect to the voice channel and play audio in it
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    message.channel.send("I need the permissions to join and speak in your voice channel!");
    return;
  }

  //Gets Youtube links for the specified Spotify link
  const spotifyResults = await spotifyAPI.getQueries(query);
  if(spotifyAPI == false){
    message.channel.send("The spotify link isn't valid");
    return;
  }

  //Checks if the queue is not initialized, if not it initializes and adds the song to the queue, otherwise just add the song to queue
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
 * Execution function for Youtube
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function isUrl(message, ignoreMaxUserSongs) {
  const query = message.content.trim().slice(6).trim()

  const voiceChannel = message.member.voice.channel;
  //Checks if the user is in a voice channel
  if (!voiceChannel){
    message.channel.send("You need to be in a voice channel to play music!");
    return;
  }
    
  const permissions = voiceChannel.permissionsFor(message.client.user);
  //Checks if the bot has the permissions to connect to the voice channel and play audio in it
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    message.channel.send("I need the permissions to join and speak in your voice channel!");
    return;
  }

  //Checks if the queue is not initialized, if not it initializes and adds the song to the queue, otherwise just add the song to queue
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
 * Execution function for Youtube, when a url is not specified
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function isQuery(message, ignoreMaxUserSongs){
  const query = message.content.trim().slice(6).trim()

  const voiceChannel = message.member.voice.channel;
  //Checks if the user is in a voice channel
  if (!voiceChannel){
    message.channel.send("You need to be in a voice channel to play music!");
    return;
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  //Checks if the bot has the permissions to connect to the voice channel and play audio in it
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    message.channel.send("I need the permissions to join and speak in your voice channel!");
    return;
  }

  //Searches the query through the Youtube API and the returns the first result
  const searchResults = await ytsr(query, {limit:1});
  if(searchResults.items.length == 0){
    message.channel.send("Couldn't find any songs with this query");
    return
  }
  const url = searchResults.items[0].url;

  //Checks if the queue is not initialized, if not it initializes and adds the song to the queue, otherwise just add the song to queue
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