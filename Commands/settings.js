const { prefix } = require("../config.json");
const fs = require("fs");
const Discord = require("discord.js");
const botConfig = require("../config.json")

/**
 * 
 * @param {Discord.Message} message 
 */
function settingsHelpMessage(message){
  const settingsMessageBuffer = fs.readFileSync(fs.realpathSync("./messageText/settingsCommand.txt"));
  let settingsMessageString = settingsMessageBuffer.toString();
  while(settingsMessageString.search("{prefix}") > 0){
    settingsMessageString = settingsMessageString.replace("{prefix}", prefix)
  }
  message.channel.send(settingsMessageString);
}

/**
 * 
 * @param {Discord.Message} message 
 */
function setMaxQueueSize(message){
  const maxQueueSize = message.content.trim().split(" ")[2];
  //console.log(maxQueueSize);

  if(Number.isNaN(Number(maxQueueSize)) && maxQueueSize != "false"){
    console.log(1);
    message.channel.send("The maximum queue size must be an integer or a boolean")
    return;
  }

  if(Number.isInteger(Number(maxQueueSize))){
    if(Number(maxQueueSize) < 1){
      message.channel.send("The maximum queue size must be more than 0");
      return;
    }
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.maxQueueSize = Number(maxQueueSize);
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("The maximum queue size was set to " + maxQueueSize);
    return;
  }
  else if(maxQueueSize == "false"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.maxQueueSize = -1;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("The maximum queue size was turned off");
    return;
  }
  else{
    console.log(2);
    message.channel.send("The maximum queue size must be an integer or a boolean");
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function setMaxUserQueueSize(message){
  const maxUserQueueSize = message.content.trim().split(" ")[2];
  //console.log(maxQueueSize);

  if(Number.isNaN(Number(maxUserQueueSize)) && maxUserQueueSize != "false"){
    message.channel.send("The maximum user queue size must be an integer or a boolean")
    return;
  }

  if(Number.isInteger(Number(maxUserQueueSize))){
    if(Number(maxUserQueueSize) < 1){
      message.channel.send("The maximum user queue size must be more than 0");
      return;
    }
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.maxUserSongs = Number(maxUserQueueSize);
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("The maximum user queue size was set to " + maxUserQueueSize);
    return;
  }
  else if(maxUserQueueSize == "false"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.maxUserSongs = -1;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("The maximum user queue size was turned off");
    return;
  }
  else{
    message.channel.send("The maximum user queue size must be an integer or a boolean");
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function setCommandChannel(message){
  const channelName = message.content.trim().slice(28).trim();
  const channel = message.guild.channels.cache.find(ch => ch.name == channelName);

  if(channel == undefined){
    message.channel.send("A channel by this name doesn't exist in this server");
    return;
  }

  const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
  const serverSettingsString = serverSettingsBuffer.toString();
  let serverSettingsJSON = JSON.parse(serverSettingsString);
  serverSettingsJSON.commandChannel = channel.id;
  fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
  message.channel.send(`The command channel was set to **${channel.name}**`);
  return;
}

/**
 * 
 * @param {Discord.Message} message 
 */
function usersNeededToSkip(message){
  const usersNeededToSkip = message.content.trim().split(" ")[2];
  //console.log(maxQueueSize);

  if(Number.isNaN(Number(usersNeededToSkip)) && usersNeededToSkip != "false"){
    message.channel.send("The % of users needed to skip must be and integer or boolean")
    return;
  }

  if(Number.isInteger(Number(usersNeededToSkip))){
    if(Number(usersNeededToSkip) < 1){
      message.channel.send("The % of users needed to skip must be 1-100");
      return;
    }
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.usersNeededToSkip = Number(usersNeededToSkip);
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("The % of users needed to skip was set to " + usersNeededToSkip);
    return;
  }
  else if(usersNeededToSkip == "false"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.usersNeededToSkip = -1;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("Now any person can skip");
    return;
  }
  else{
    message.channel.send("The % of users needed to skip must be and integer or boolean");
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function autoPlay(message){
  const autoPlay = message.content.trim().split(" ")[2]

  if(autoPlay == "true"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.autoPlay = true;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("AutoPlay is now on");
    return;
  }
  else if(autoPlay == "false"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.autoPlay = false;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("AutoPlay is now off");
    return;
  }
  else{
    message.channel.send("To turn AutoPlay on or off you must write 'true' or 'false'");
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function removeUserCommands(message){
  const removeUserCommands = message.content.trim().split(" ")[2]

  if(removeUserCommands == "true"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.autoRemoveUserCommands = true;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("User commands will now be removed automatically");
    return;
  }
  else if(removeUserCommands == "false"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.autoRemoveUserCommands = false;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("User commands will not be removed automatically");
    return;
  }
  else{
    message.channel.send("To turn automatic user command removal on or off you must write 'true' or 'false'");
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function removeBotMessages(message){
  const removeBotMessages = message.content.trim().split(" ")[2]

  if(removeBotMessages == "true"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.autoRemoveBotMessages = true;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("Bot messages will now be removed automatically");
    return;
  }
  else if(removeBotMessages == "false"){
    const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
    const serverSettingsString = serverSettingsBuffer.toString();
    let serverSettingsJSON = JSON.parse(serverSettingsString);
    serverSettingsJSON.autoRemoveBotMessages = false;
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4))
    message.channel.send("Bot messages will not be removed automatically");
    return;
  }
  else{
    message.channel.send("To turn automatic bot message removal on or off you must write 'true' or 'false'");
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function setRole(message){
  //!settings setRole roleName settingName value
  const re1 = new RegExp(`/^${botConfig.prefix}settings setRole "([A-Za-z]+ ?)+" [A-Za-z]+ (true|false)/`)
  if(re1.test(message.content) == false){
    message.channel.send("The command must be written in this format:\n**!settings setRole \"some role\" permission [true/false]**\n" +
    "If it doesn't work check your white spaces and quotation marks");
    return;
  }
  const args = message.content.trim().slice(18).trim();
  const roleName = args.split("\"")[1];
  const permission = args.split("\"")[2].trim().split(" ")[0];
  const value = args.split("\"")[2].trim().split(" ")[1];

  let roleID = message.guild.roles.cache.find(role => role.name == roleName);
  if(roleID == undefined){
    message.channel.send("A role by this name doesn't exist in this server");
    return;
  }
  roleID = roleID.id;

  const permissionList = ["forceSkip", "clearQueue", "ignoreMaxUserSongs", "skipTo", "stop", "addPlaylist"];
  if(permissionList.includes(permission) == false){
    message.channel.send("A permission by this name doesn't exist\nAvailable permissions:\n" +
    "forceSkip, clearQueue, ignoreMaxUserSongs, skipTo, stop, addPlaylist");
    return;
  }

  const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
  const serverSettingsString = serverSettingsBuffer.toString();
  let serverSettingsJSON = JSON.parse(serverSettingsString);

  let hasRole = false;
  let roleIndex = -1;
  for (let i = 0; i < serverSettingsJSON.roles.length; i++) {
    if(serverSettingsJSON.roles[i].roleID == roleID){
      hasRole = true;
      roleIndex = i;
    }    
  }
  if(hasRole == false){

    let roleSettings = {
      roleID: roleID,
      Permissions: {
        "forceSkip":false,
        "clearQueue":false,
        "ignoreMaxUserSongs":false,
        "skipTo":false,
        "stop":false,
        "addPlaylist":false
      }
    }
    roleSettings.Permissions[permission] = Boolean(value);
    serverSettingsJSON.roles.push(roleSettings);
  }
  else{
    let roleSettings = serverSettingsJSON.roles[roleIndex];
    roleSettings.Permissions[permission] = Boolean(value);
    serverSettingsJSON.roles[roleIndex] = roleSettings
  }

  fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4));
  message.channel.send(setRoleConfirmationMessages(roleName, permission, value));
  return;
}

function setRoleConfirmationMessages(roleName, permission, value){
  if(permission == "forceSkip"){
    if(value == "true"){
      return `Users with the role **${roleName}** can now force skip songs`;
    }
    else{
      return `Users with the role **${roleName}** don't have permission to force skip songs`;
    }
  }
  else if(permission == "clearQueue"){
    if(value == "true"){
      return `Users with the role **${roleName}** can now clear the queue`;
    }
    else{
      return `Users with the role **${roleName}** don't have permission to clear the queue`;
    }
  }
  else if(permission == "maxUserSongs"){
    if(value == "true"){
      return `Users with the role **${roleName}** can add any amount of songs to the queue`;
    }
    else{
      return `Users with the role **${roleName}** can only add the set amount of songs to the queue`;
    }
  }
  else if(permission == "skipTo"){
    if(value == "true"){
      return `Users with the role **${roleName}** can now skip to any song in the queue`;
    }
    else{
      return `Users with the role **${roleName}** don't have permission to skip to any song in the queue`;
    }
  }
  else if(permission == "stop"){
    if(value == "true"){
      return `Users with the role **${roleName}** can now disconnect the bot from the channel`;
    }
    else{
      return `Users with the role **${roleName}** don't have permission to disconnect the bot from the channel`;
    }
  }
  else if(permission == "addPlaylist"){
    if(value == "true"){
      return `Users with the role **${roleName}** can now add a playlist`;
    }
    else{
      return `Users with the role **${roleName}** don't have permission to add a playlist`;
    }
  }
}

/**
 * 
 * @param {Discord.Message} message 
 */
function roles(message){
  const re1 = new RegExp(`/^${botConfig.prefix}settings roles (true|false)/`)
  if(re1.test(message.content.trim()) == false){
    message.channel.send("The command must be written in this format:\n**!settings roles [true/false]**");
    return;
  }

  const value = Boolean(message.content.trim().slice(16).trim());

  const serverSettingsBuffer = fs.readFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"));
  const serverSettingsString = serverSettingsBuffer.toString();
  let serverSettingsJSON = JSON.parse(serverSettingsString);

  if(value == true){
    serverSettingsJSON.noRoles = false;
    message.channel.send("Roles are now deactivated");
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4));
    return;
  }
  else{
    serverSettingsJSON.noRoles = true;
    message.channel.send("Roles are now activated");
    fs.writeFileSync(fs.realpathSync("./ServerSettings/" + message.guild.id + ".json"), JSON.stringify(serverSettingsJSON, null, 4));
    return;
  }
}

/**
 * 
 * @param {Discord.Message} message 
 * @returns 
 */
function settings(message){
  if(message.content.trim() == `${prefix}settings`){
    settingsHelpMessage(message);
  }
  else if(message.content.trim().includes(`${prefix}settings setRole`)){
    setRole(message);
  }
  else if(message.content.trim().includes(`${prefix}settings roles`)){
    roles(message);
  }
  else if(message.content.trim().includes(`${prefix}settings setMaxQueueSize`)){
    setMaxQueueSize(message);
  }
  else if(message.content.trim().includes(`${prefix}settings setMaxUserQueueSize`)){
    setMaxUserQueueSize(message);
  }
  else if(message.content.trim().includes(`${prefix}settings setCommandChannel`)){
    setCommandChannel(message);
  }
  else if(message.content.trim().includes(`${prefix}settings usersNeededToSkip`)){
    usersNeededToSkip(message);
  }
  else if(message.content.trim().includes(`${prefix}settings autoPlay`)){
    autoPlay(message);
  }
  else if(message.content.trim().includes(`${prefix}settings removeUserCommands`)){
    removeUserCommands(message);
  }
  else if(message.content.trim().includes(`${prefix}settings removeBotMessages`)){
    removeBotMessages(message);
  }
}

module.exports = {
  settings
}