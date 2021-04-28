const { prefix } = require("../config.json");
const fs = require("fs");
const Discord = require("discord.js");

/**
 * Prints the command information message
 * @param {Discord.Message} message that was sent by the user
 * @returns 
 */
function help(message) {
  let helpMessageBuffer = fs.readFileSync(fs.realpathSync("./messageText/helpCommand.txt"));
  let helpMessageString = helpMessageBuffer.toString();
  while(helpMessageString.search("{prefix}") > 0){
    helpMessageString = helpMessageString.replace("{prefix}", prefix)
  }  
  message.channel.send(helpMessageString);
}

module.exports = {
    help
}