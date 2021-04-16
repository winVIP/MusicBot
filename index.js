const Discord = require("discord.js");
const fs = require("fs");
const path = require("path")
const { prefix, token } = require("./config.json");
const queue = require("./queue.js");
const dispatcherControls = require("./dispatcherControls")
const { execute } = require("./Commands/execute.js");
const { skip } = require("./Commands/skip.js");
const { stop } = require("./Commands/stop.js");
const { forceSkip } = require("./Commands/forceSkip.js");
const { settings } = require("./Commands/settings.js");
const { queueList } = require("./Commands/queueList.js");
const { clear } = require("./Commands/clear.js");
const { help } = require("./Commands/help.js");
const { skipTo } = require("./Commands/skipTo.js");
const { Playlist } = require('./Commands/playlist')
const { search } = require("./Commands/search")
const { pause } = require("./Commands/pause")
const { resume } = require("./Commands/resume")
const soundcloud = require("./Commands/soundCloud")
const { history } = require("./Commands/history")

const client = new Discord.Client();

//var queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.on("voiceStateUpdate", async (oldPresence, newPresence) => {
  if(oldPresence.channel != undefined && newPresence.channel == undefined){
    if(oldPresence.channel.members.filter(member => !member.user.bot).size == 0){
      await setTimeout(async () => {
        const connection = await queue.getConnection(oldPresence.guild.id);
        if(typeof connection != "string"){
          await connection.disconnect()
        }
      }, 1000 * 60, "botDisconnect")      
    }    
  }
  if(newPresence.id == client.user.id){
    if(newPresence.channel == undefined){
      await queue.destroyQueue(oldPresence.guild.id)
      await dispatcherControls.setDispatcher(undefined)
    }
  }
});

client.on("message", async message => {
  let serverSettings;
  const fullPath = path.resolve("./ServerSettings")
  if(fs.existsSync(fullPath + "\\" + message.guild.id + ".json") == true){
    serverSettings = require(fullPath + "\\" + message.guild.id + ".json");
  }
  if(message.author.bot){
    if(serverSettings.autoRemoveBotMessages == true){
      message.delete({timeout:2000});
      return;
    }
    else{
      return;
    }
  } 
  if(!message.content.startsWith(prefix)) return;
  if(message.content.startsWith(prefix)){
    if(serverSettings.autoRemoveUserCommands == true){
      message.delete({timeout:2000})
    }
  }
  
  if(message.channel.id != serverSettings.commandChannel && serverSettings.commandChannel != ""){
    const commandChannelName = message.guild.channels.cache.find(ch => ch.id == serverSettings.commandChannel).name
    message.channel.send(`This channel can't be used for bot commands, use **${commandChannelName}**`);
    return;
  }

  
  if(message.content.startsWith(`${prefix}playlist`)){
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      Playlist(message, false);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.ignoreMaxUserSongs == true){
              result = true;
            }
          }          
        }        
      }
      Playlist(message, result);
    }
  }
  else if(message.content.startsWith(`${prefix}history`)){
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      history(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.ignoreMaxUserSongs == true){
              result = true;
            }
          }          
        }        
      }
      history(message, result);
    }
  }
  else if(message.content.startsWith(`${prefix}pause`)){
    pause(message)
    return
  }
  else if(message.content.startsWith(`${prefix}resume`)){
    resume(message)
    return
  }
  else if(message.content.startsWith(`${prefix}soundcloud`)){
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      soundcloud.search(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.ignoreMaxUserSongs == true){
              result = true;
            }
          }          
        }        
      }
      soundcloud.search(message, result);
    }
  }
  else if (message.content.startsWith(`${prefix}play`)) {
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      execute(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.ignoreMaxUserSongs == true){
              result = true;
            }
          }          
        }        
      }
      execute(message, result);
    }
  } 
  else if (message.content.startsWith(`${prefix}skip`)) {
    if(message.content.startsWith(`${prefix}skipTo`)) {
      skipTo(message);
      return;
    }
    skip(message);
    return;
  } 
  else if (message.content.startsWith(`${prefix}stop`)) {
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      stop(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.stop == true){
              result = true;
            }
          }          
        }        
      }
      if(result == true){
        stop(message);
        return;
      }
      else{
        message.channel.send("You don't have permission to use this command")
        return;
      }
    }
  } 
  else if (message.content.startsWith(`${prefix}fs`)) {
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      forceSkip(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.forceSkip == true){
              result = true;
            }
          }          
        }        
      }
      if(result == true){
        forceSkip(message);
        return;
      }
      else{
        message.channel.send("You don't have permission to use this command")
        return;
      }
    }
  } 
  else if (message.content.startsWith(`${prefix}settings`)) {
    settings(message);
    return;
  } 
  else if (message.content.startsWith(`${prefix}queue`)) {
    queueList(message);
    return;
  }
  else if (message.content.startsWith(`${prefix}clear`)) {
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      clear(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.clearQueue == true){
              result = true;
            }
          }          
        }        
      }
      if(result == true){
        clear(message);
        return;
      }
      else{
        message.channel.send("You don't have permission to use this command")
        return;
      }
    }
  }
  else if(message.content.startsWith(`${prefix}help`)) {
    help(message);
    return;
  }
  else if(message.content.startsWith(`${prefix}search`)) {
    const serverConfig = require("./ServerSettings/" + message.guild.id + ".json");
    if(serverConfig.noRoles == true){
      search(message);
      return;
    }
    else{
      const serverRoles = serverConfig.roles;
      let memberRoleIds = Array.from(message.member.roles.cache.keys());
      let result = false
      for (let i = 0; i < memberRoleIds.length; i++) {
        for (let j = 0; j < serverRoles.length; j++) {
          if(memberRoleIds[i] == serverRoles[j].roleID){
            if(serverRoles[j].Permissions.ignoreMaxUserSongs == true){
              result = true;
            }
          }          
        }        
      }
      search(message, result);
    }
  }
  else {
    message.channel.send("You need to enter a valid command!");
    return;
  }
});

client.on("guildCreate", async guild => {
  console.log("Guild id: " +  guild.id)
  try{
    const fullPath = path.resolve("./ServerSettings")
    fs.writeFileSync(fullPath + "\\" + guild.id + ".json", "")
    console.log("baige")
    fs.copyFileSync(fullPath + "\\" + "defaultSettings.json", fullPath + "\\" + guild.id + ".json")  
  }
  catch(e){
    console.log(e)
  }
});

client.on("guildDelete", async guild => {
  console.log("Guild id: " +  guild.id)
  try{
    const fullPath = path.resolve("./ServerSettings")
    if(fs.existsSync(fullPath + "\\" + guild.id + ".json") == true){
      fs.unlinkSync(fullPath + "\\" + guild.id + ".json");
    } 
  }
  catch(e){
    console.log(e)
  }
});

client.login(token);