const ytdl = require("ytdl-core");
const queue = require("./../queue.js");
const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function queueList(message) {  
  if(/^!queue$/.test(message.content.trim()) == true){
    getQueueList(message);
  }
  else if(/^!queue shuffle$/.test(message.content.trim()) == true){
    shuffleQueue(message)
  }
}

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function getQueueList(message) {  
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel){
    message.channel.send("You need to be in a voice channel to use this command!");
    return;
  }

  const songList = await queue.getSongList(message.guild.id);

  message.channel.send(songList.slice(0, 2000));
}

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
async function shuffleQueue(message){
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel){
    message.channel.send("You need to be in a voice channel to shuffle the queue");
    return;
  }

  const songCount = await queue.getServerSongCount(message.guild.id);
  if(songCount <= 2){
    message.channel.send("The queue is too small, it needs to have at least 3 items")
    return
  }

  await queue.shuffle(message.guild.id);

  message.channel.send("The queue was shuffled")
  return;
}

module.exports = {
    queueList
}