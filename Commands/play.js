const ytdl = require("ytdl-core");
const queue = require("./../queue.js");
const userQueue = require("../userQueue.js");

function play(guild, song, message) {
    const serverQueue = queue.get(guild.id);
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
    serverQueue.textChannel.send(`Started playing: **${song.title}** You have added ${userSongsAdded}/${maxUserSongs}`);
    return;
}

module.exports = {
    play
}