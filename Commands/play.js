const ytdl = require("ytdl-core");
const queue = require("./../queue.js");
const Discord = require("discord.js");
const scdl = require("soundcloud-downloader").default;
const dispatcherControls = require("../dispatcherControls")
const historyList = require("../history")

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function play(message, ignoreMaxUserSongs) {
    let songToPlay = await queue.getSongToPlay(message.guild.id);
    if(typeof songToPlay != "string" && songToPlay.platform == "soundcloud"){
        playSoundCloud(message, ignoreMaxUserSongs)
        return
    }
    const serverSettings = require("../ServerSettings/" + message.guild.id + ".json");
    const autoPlay = Boolean(serverSettings.autoPlay);
    if(songToPlay == "The queue is empty"){
        if(autoPlay == true){
            const membersInVoiceChannel = message.member.voice.channel.members.size;
            if(membersInVoiceChannel > 0){
                const lastSongPlayed = await historyList.getSongForAutoplay(message);
                const songInfo = await ytdl.getBasicInfo(lastSongPlayed.url);
                const relatedSongs = songInfo.related_videos;

                function getRandomInt(max) {
                    return Math.floor(Math.random() * max);
                }

                const relatedSongInfo = await ytdl.getBasicInfo(relatedSongs[getRandomInt(relatedSongs.length - 1)].id);

                const voiceChannel = message.member.voice.channel;
                await queue.addSong(message.channel, voiceChannel, relatedSongInfo.videoDetails.video_url, message.guild.id, "autoPlay", true);
                songToPlay = await queue.getSongToPlay(message.guild.id);
            }
        }
        else{
            message.channel.send("The queue is empty, leaving channel");
            message.member.voice.channel.leave();
            queue.destroyQueue(message.guild.id);
            return;
        }
    }
    try{
        await historyList.add(message, songToPlay)
    }
    catch(e){
        console.log(e)
    }
    const serverConnection = await queue.getConnection(message.guild.id);
    const dispatcher = serverConnection.play(ytdl(songToPlay.url, {filter:"audioonly"}))
    .on("finish", async () => {
        await queue.removeSong(1, message.guild.id);
        await dispatcherControls.setDispatcher(undefined)
        play(message, ignoreMaxUserSongs);
    })
    .on("error", error => console.log("Is play:" + error));
    await dispatcher.setVolumeLogarithmic(1);
    await dispatcherControls.setDispatcher(dispatcher)

    const songTitle = songToPlay.title;

    message.channel.send(`Started playing:\n**${songTitle}**\n`);
    return;
}

async function playSoundCloud(message, ignoreMaxUserSongs){
    let songToPlay = await queue.getSongToPlay(message.guild.id);

    const serverConnection = await queue.getConnection(message.guild.id);
    const dispatcher = serverConnection.play(await scdl.download(songToPlay.url))
    .on("finish", async () => {
        console.log("finish")
        await queue.removeSong(1, message.guild.id);
        await dispatcherControls.setDispatcher(undefined)
        play(message, ignoreMaxUserSongs);
    })
    .on("error", error => console.log("Is play:" + error));
    dispatcher.setVolumeLogarithmic(1);
    await dispatcherControls.setDispatcher(dispatcher)

    const songTitle = songToPlay.title;

    message.channel.send(`Started playing:\n**${songTitle}**\n`);
    return;
}

module.exports = {
    play
}