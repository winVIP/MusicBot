const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const queue = require("./queue.js");
const { execute } = require("./Commands/execute.js");
const { skip } = require("./Commands/skip.js");
const { stop } = require("./Commands/stop.js");
const { forceSkip } = require("./Commands/forceSkip.js");
const { settings } = require("./Commands/settings.js");
const { queueList } = require("./Commands/queueList.js");
const { clear } = require("./Commands/clear.js");
const { help } = require("./Commands/help.js");
const { skipTo } = require("./Commands/skipTo.js");

const client = new Discord.Client();

//var queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});



client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  if (message.content.startsWith(`${prefix}play`)) {
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
            if(serverRoles[j].Permissions.maxUserSongs == true){
              result = true;
            }
          }          
        }        
      }
      if(result == true){
        execute(message, false);
        return;
      }
      else{
        execute(message, true);
        return;
      }
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
  else {
    message.channel.send("You need to enter a valid command!");
    return;
  }
});

client.on("guildCreate", async guild => {
  var fs = require("fs");
  fs.copyFile("./ServerSettings/defaultSettings.json", "./ServerSettings/" + guild.id + ".json", (err) => {
    if (err) throw err;
    console.log('Server settings added');
  });
});

client.on("guildDelete", async guild => {
  var fs = require("fs");
  fs.unlink("./ServerSettings/" + guild.id + ".json", (err) => {
    if (err) throw err;
    console.log('Server settings removed');
  });
});

client.on("test", console.log);

client.login(token);

const testGuild = {
  name: "Test Guild",
  id: "484894126195898"
};

//client.emit('guildCreate', testGuild);