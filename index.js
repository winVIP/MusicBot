const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const queue = require("./queue.js");
const { execute } = require("./Commands/execute.js");
const { skip } = require("./Commands/skip.js");
const { stop } = require("./Commands/stop.js");
const { forceSkip } = require("./Commands/forceSkip.js");
const { settings } = require("./Commands/settings.js");

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

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    //nes async
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}fs`)) {
    forceSkip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}settings`)) {
    settings(message);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
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