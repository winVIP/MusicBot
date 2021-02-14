const ytdl = require("ytdl-core");
const { play } = require("./play.js");
const queue = require("./../queue.js");
const userQueue = require("../userQueue.js");

async function execute(message, serverQueue) {
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
    const addResult = userQueue.add(message.guild.id, message.author.id);
    if(addResult == false){
      message.channel.send("You have reached the maximum songs that you can add to the queue");
      return;
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
     };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0], message);
        return;
      } 
      catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        message.channel.send(err);
        return;
      }
    } 
    else {
      serverQueue.songs.push(song);
      const songTitle = song.title;
      const userSongsAdded = userQueue.get(message.guild.id, message.author.id);
      const serverSettings = require("../ServerSettings/" + message.guild.id + ".json");
      const maxUserSongs = serverSettings["maxUserSongs"];
      message.channel.send(`${songTitle} has been added to the queue! You have added ${userSongsAdded}/${maxUserSongs}`);
      return;
    }
}

module.exports = {
    execute
}