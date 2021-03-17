const ytdl = require("ytdl-core");
const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function play(message) {
    const songToPlay = await queue.getSongToPlay(message.guild.id);
    //console.log(songToPlay);
    if(songToPlay == "The queue is empty"){
        message.channel.send("The queue is empty, leaving channel");
        queue.clearQueue(message.guild.id);
        message.member.voice.channel.leave();
        return;
    }
    const serverConnection = await queue.getConnection(message.guild.id);
    //console.log(serverConnection);
    //console.log(typeof songToPlay.url);
    //console.log(ytdl(songToPlay.url));
    const dispatcher = serverConnection.play(ytdl(songToPlay.url))
    .on("finish", async () => {
        console.log("Ended");
        console.log(await queue.removeSong(1, message.guild.id));
        play(message);
    })
    .on("error", error => console.log("Is play:" + error));
    dispatcher.setVolumeLogarithmic(1);
    //console.log(dispatcher);

    const userSongsCount = await queue.getUserSongCount(message.guild.id, message.member.id);
    const serverSongCount = await queue.getServerSongCount(message.guild.id);

    const serverSettings = require("../ServerSettings/" + message.guild.id + ".json");
    const maxUserSongs = serverSettings["maxUserSongs"];
    const maxServerSongs = serverSettings["maxQueueSize"];

    const songTitle = songToPlay.title;

    let songAddedToQueueMessage = `Song added to queue:\n**${songTitle}**\n`;
    if(maxUserSongs != -1){
        songAddedToQueueMessage = songAddedToQueueMessage + `You have added **${userSongsCount}/${maxUserSongs}**\n`;
    }
    if(maxServerSongs != -1){
        songAddedToQueueMessage = songAddedToQueueMessage + `Server queue **${serverSongCount}/${maxServerSongs}**`;
    }
    message.channel.send(songAddedToQueueMessage);
    return;


    /* const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.remove(guild.id);
        userQueue.deleteGuild(message.guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
        serverQueue.songs.shift();
        userQueue.remove(message.guild.id, message.author.id);
        play(guild, serverQueue.songs[0], message);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    console.log(message.guild.id);
    const userSongsAdded = userQueue.get(message.guild.id, message.author.id);
    const serverSettings = require("../ServerSettings/" + message.guild.id + ".json");
    const maxUserSongs = serverSettings["maxUserSongs"];
    const maxServerSongs = serverSettings["maxQueueSize"];
    const serverSongsAdded = queue.queueSize(message.guild.id);
    serverQueue.textChannel.send(`Started playing: **${song.title}** You have added **${userSongsAdded}/${maxUserSongs}** Server queue **${serverSongsAdded}/${maxServerSongs}**`);
    return; */
}

module.exports = {
    play
}