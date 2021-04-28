const fs = require("fs")
const Discord = require("discord.js")
const ytdl = require("ytdl-core");

/**
 * 
 * @param {Discord.Message} message 
 * @param {*} song 
 */
async function add(message, song){
    try{
        const result = fs.existsSync("./historyFiles/" + message.guild.id + ".json");
        if(result == false){
            fs.writeFileSync("./historyFiles/" + message.guild.id + ".json", JSON.stringify([], null, 4));
        }
        let history = fs.readFileSync("./historyFiles/" + message.guild.id + ".json").toString()
        history = JSON.parse(history)
        history.push(song)
        fs.writeFileSync("./historyFiles/" + message.guild.id + ".json", JSON.stringify(history, null, 4));
        return
    }
    catch(e){
        console.log(e)
        return
    }
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function clear(message){
    const result = fs.existsSync("./historyFiles/" + message.guild.id + ".json");
    if(result == false){
        return "History is already clear"
    }

    fs.writeFileSync("./historyFiles/" + message.guild.id + ".json", JSON.stringify([], null, 4));
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function getAll(message){
    const result = fs.existsSync("./historyFiles/" + message.guild.id + ".json");
    if(result == false){
        return "History is empty"
    }

    let history = fs.readFileSync("./historyFiles/" + message.guild.id + ".json").toString()
    history = JSON.parse(history)
    if(history.length == 0){
        return "History is empty"
    }
    return history
}

/**
 * 
 * @param {Discord.Message} message 
 */
async function get(message){
    const result = fs.existsSync("./historyFiles/" + message.guild.id + ".json");
    if(result == false){
        return "History is empty"
    }

    let history = fs.readFileSync("./historyFiles/" + message.guild.id + ".json").toString()
    history = JSON.parse(history)
    if(history.length == 0){
        return "History is empty"
    } 

    const query = message.content.trim().split(9).trim();
    if(Number.isNaN(Number(query)) && Number.isInteger(Number(query))){
        return "Index must be an integer"
    }

    if(Number(query) < 1){
        return "Index must be larger than 1"
    }

    if(Number(query) > history.length){
        return "Index must be smaller than " + history.length
    }

    return history[query]
}

async function getSongForAutoplay(message){
    const result = fs.existsSync("./historyFiles/" + message.guild.id + ".json");
    if(result == false){
        return "History is empty"
    }

    let history = fs.readFileSync("./historyFiles/" + message.guild.id + ".json").toString()
    history = JSON.parse(history)
    if(history.length == 0){
        return "History is empty"
    }

    for (let i = history.length - 1; i >= 0; i--) {
        const ytdlResult = ytdl.validateURL(history[i].url);
        if(ytdlResult == true){
            return history[i]
        }
    }
    return "No songs to autoplay"
}

module.exports = {
    add,
    getAll,
    get,
    clear,
    getSongForAutoplay
}