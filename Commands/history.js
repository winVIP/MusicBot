const scdl = require("soundcloud-downloader").default
const validUrl = require("valid-url")
const ytsr = require("ytsr");
const Discord = require("discord.js")
const ytdl = require("ytdl-core")

const historyList = require("../history")
const spotifyAPI = require("../spotifyAPI");
const { play } = require("./play.js");
const queue = require("../queue")
const botConfig = require("../config.json")

/**
 * Redirects to specific history commands
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function history(message, ignoreMaxUserSongs){
    const re1 = new RegExp(`/^${botConfig.prefix}history list$/`)
    const re2 = new RegExp(`/^${botConfig.prefix}history [0-9]+$/`)
    const re3 = new RegExp(`/^${botConfig.prefix}history play [0-9]+$/`)
    const re4 = new RegExp(`/^${botConfig.prefix}history clear$/`)
    if(re1.test(message.content.trim())){
        getList(message)
        return
    }
    else if(re2.test(message.content.trim())){
        getDetails(message)
        return
    }
    else if(re3.test(message.content.trim())){
        playSelection(message, ignoreMaxUserSongs)
        return
    }
    else if(re4.test(message.content.trim())){
        clear(message)
        return
    }
}

/**
 * 
 * @param {Discord.Message} message that was sent by the user
 */
async function getList(message){
    const itemsInPage = 5;
    const result = await historyList.getAll(message);
    if(typeof result == "string"){
        message.channel.send(result)
        return
    }

    const re1 = new RegExp(`/^${botConfig.prefix}history list$/`)
    const re2 = new RegExp(`/^${botConfig.prefix}history list [0-9]+$/`)
    if(re1.test(message.content.trim())){
        let returnMessage = "History:"
        let resultLength = itemsInPage;
        if(resultLength > result.length){
            resultLength = result.length
        }
        for (let i = 0; i < resultLength; i++) {
            returnMessage =  returnMessage + "\n" + (i + 1) + ". " + result[i].title
        }
        const numberOfPages = Math.ceil(result.length / itemsInPage)
        returnMessage = returnMessage + "\n" + "Page 1 of " + numberOfPages
        message.channel.send(returnMessage);
        return;
    }
    else if(re2.test(message.content.trim())){
        const page = message.content.trim().slice(14).trim();
        if(Number.isNaN(Number(page)) || Number.isInteger(Number(page)) == false){
            message.channel.send("The page number must be an integer")
            return
        }

        const pageNumber = Number(page);
        if(pageNumber < 1){
            message.channel.send("The page number must be more than 1");
            return
        }

        const numberOfPages = Math.ceil(result.length / itemsInPage)
        if(pageNumber > numberOfPages){
            message.channel.send(`There are only ${numberOfPages}`)
            return
        }

        let endOfPage = pageNumber * itemsInPage;
        if(result.length < endOfPage){
            endOfPage = result.length
        }

        let returnMessage = "History:"
        for (let i = (pageNumber - 1) * itemsInPage; i < endOfPage; i++) {
            returnMessage =  returnMessage + "\n" + (i + 1) + ". " + result[i].title            
        }
        returnMessage = returnMessage + "\n" + "Page " + pageNumber + " of " + numberOfPages
        message.channel.send(returnMessage);
        return;
    }    
}

/**
 * 
 * @param {Discord.Message} message that was sent by the user
 */
async function getDetails(message){
    const index = message.content.trim().slice(9).trim();

    const result = await historyList.getAll(message);
    if(typeof result == "string"){
        message.channel.send(result)
        return
    }

    if(Number.isNaN(Number(index)) || Number.isInteger(Number(index)) == false){
        message.channel.send("The list number must be an integer")
        return
    }

    const listNumber = Number(index);
    if(listNumber < 1){
        message.channel.send("The list number must be more than 1");
        return
    }

    const numberOfItems = result.length
    if(listNumber > numberOfItems){
        message.channel.send(`There are only ${numberOfItems}`)
        return
    }

    const song = result[listNumber - 1];
    if(song.platform == "youtube"){
        let songInfo = await ytdl.getBasicInfo(song.url);
        let returnMessage = "Song information:"
        returnMessage = returnMessage + "\n" + "Channel: " + songInfo.videoDetails.ownerChannelName
        returnMessage = returnMessage + "\n" + "Title: " + songInfo.videoDetails.title
        returnMessage = returnMessage + "\n" + "Url: <" + songInfo.videoDetails.video_url + ">"
        const minutes = Math.floor(songInfo.videoDetails.lengthSeconds / 60)
        const seconds = songInfo.videoDetails.lengthSeconds - (minutes * 60)
        returnMessage = returnMessage + "\n" + "Length: " + minutes + ":" + seconds
        message.channel.send(returnMessage);
        return;
    }
    else if(song.platform == "soundcloud"){
        let songInfo = await scdl.getInfo(song.url);
        let returnMessage = "Song information:"
        returnMessage = returnMessage + "\n" + "Author: " + songInfo.user.username
        returnMessage = returnMessage + "\n" + "Title: " + songInfo.title
        returnMessage = returnMessage + "\n" + "Url: <" + songInfo.permalink_url + ">"
        const minutes = Math.floor(songInfo.full_duration / 1000 / 60)
        const seconds = Math.floor(songInfo.duration / 1000) - (minutes * 60)
        returnMessage = returnMessage + "\n" + "Length: " + minutes + ":" + seconds
        message.channel.send(returnMessage);
        return;
    }
}


/**
 * 
 * @param {Discord.Message} message that was sent by the user
 */
async function clear(message){
    const result = await historyList.clear(message)
    if(typeof result == "string"){
        message.channel.send(result)
        return
    }
    message.channel.send("History cleared")
    return
}

/**
 * 
 * @param {Discord.Message} message that was sent by the user
 */
async function playSelection(message, ignoreMaxUserSongs){
    const index = message.content.trim().slice(14).trim();

    const result = await historyList.getAll(message);
    if(typeof result == "string"){
        message.channel.send(result)
        return
    }

    if(Number.isNaN(Number(index)) || Number.isInteger(Number(index)) == false){
        message.channel.send("The list number must be an integer")
        return
    }

    const listNumber = Number(index);
    if(listNumber < 1){
        message.channel.send("The list number must be more than 1");
        return
    }

    const numberOfItems = result.length
    if(listNumber > numberOfItems){
        message.channel.send(`There are only ${numberOfItems}`)
        return
    }

    const song = result[listNumber - 1];

    if(scdl.isValidUrl(song.url) == true){
        console.log("SoundCloud")
        isSoundCloudURL(message, ignoreMaxUserSongs, song.url)
        return
    }
    else if(song.url.includes("spotify") == true){
        console.log("Spotify")
        isSpotifyUrl(message, ignoreMaxUserSongs, song.url)
        return
    }
    else{
        console.log("Youtube")
        isUrl(message, ignoreMaxUserSongs, song.url)
        return
    }
}

/**
 * Execution function for SoundCloud
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function isSoundCloudURL(message, ignoreMaxUserSongs, songURL){  
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
    const info = await scdl.getInfo(songURL);
    scURLs.push(info);

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
async function isSpotifyUrl(message, ignoreMaxUserSongs, songURL){  
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

const spotifyResults = await spotifyAPI.getQueries(songURL);
if(spotifyAPI == false){
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
 * Execution function for Youtube
 * @param {Discord.Message} message that was sent by the user
 * @param {Boolean} ignoreMaxUserSongs if this user can ignore the set max user songs
 * @returns 
 */
async function isUrl(message, ignoreMaxUserSongs, songURL) {  
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
    const addResult = await queue.addSong(message.channel, voiceChannel, songURL, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    const addResult = await queue.addSong(message.channel, voiceChannel, songURL, message.guild.id, message.member.id, ignoreMaxUserSongs);
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
    history
}