const MongoClient = require('mongodb').MongoClient;
const botConfig = require("../config.json")
const uri = `mongodb+srv://${botConfig.MongoDbUserName}:${botConfig.MongoDbPassword}@discordmusicbot.blaug.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function add(guildId, song){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("History")
    const doc = await collection.findOne({guildId:guildId})
    if(doc == null){
        collection.insertOne({
            guildId: guildId,
            songs: [song]
        })
        return
    }
    doc.songs.push(song)
    await client.db("DiscordMusicBotDB").collection("History").updateOne({_id:doc._id},{$set:doc})
    return
}

async function clear(guildId){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("History")
    await collection.deleteOne({guildId:guildId})
    return
}

async function getByPage(guildId, page){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("History")
    const doc = await collection.findOne({guildId:guildId})
    if(doc == null){
        return "History empty"
    }
    const songs = doc.songs;
    if(songs.length == 0){
        return "History empty"
    }
    const pageLength = 20;
    const pageCount = Math.ceil(songs.length / pageLength)
    if(page > pageCount){
        return `There are only ${pageCount} pages`
    }
    if(page * pageLength > songs.length){
        const result = songs.slice((page - 1) * pageLength)
        return result
    }
    else{
        const result = songs.slice((page - 1) * pageLength, page * pageLength)
        return result
    }
}

async function getSongToPlay(guildId){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("History")
    const doc = await collection.findOne({guildId:guildId})
    if(doc == null){
        return "History empty"
    }
    const songs = doc.songs;
    if(songs.length == 0){
        return "History empty"
    }
    const songIndex = songs.length - 1
    const songToPlay = songs[songIndex]
    return songToPlay
}

async function getSong(guildId, index){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("History")
    const doc = await collection.findOne({guildId:guildId})
    if(doc == null){
        return "History empty"
    }
    const songs = doc.songs;
    if(songs.length == 0){
        return "History empty"
    }
    const arrayIndex = index - 1
    const maxIndex = songs.length - 1
    if(maxIndex < arrayIndex){
        return `History only has ${songs.length} songs`
    }
    return songs[arrayIndex]
}

module.exports = {
    add,
    clear,
    getByPage,
    getSongToPlay,
    getSong
}