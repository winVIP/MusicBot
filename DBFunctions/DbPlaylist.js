const MongoClient = require('mongodb').MongoClient;
const botConfig = require("../config.json")
const uri = `mongodb+srv://${botConfig.MongoDbUserName}:${botConfig.MongoDbPassword}@discordmusicbot.blaug.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function addSong(guildID, playlistName, url){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("Playlist")
    const doc = await collection.findOne({guildID:guildID})
    if(doc == null){
        return "Playlist by this name doesn't exist"
    }
    if(doc.playlists[playlistName] == undefined
    || doc.playlists[playlistName] == "" 
    || doc.playlists[playlistName] == null){
        return "Playlist by this name doesn't exist"
    }
    doc.playlists[playlistName].push(url)
    await client.db("DiscordMusicBotDB").collection("Playlist").updateOne({_id:doc._id},{$set:doc})
    return
}

async function addPlaylist(guildID, playlistName){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("Playlist")
    const doc = await collection.findOne({guildId:guildId})
    if(doc != null){
        let newEntry = {}
        newEntry.guildID = guildID
        newEntry.playlists = {}
        newEntry.playlists[playlistName] = []
        collection.insertOne(newEntry)
        return
    }
    newEntry.playlists[playlistName] = []
    collection.insertOne(newEntry)
    return
}

async function removeSong(guildID, playlistName, index){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("Playlist")
    const doc = await collection.findOne({guildID:guildID})
    if(doc == null){
        return "Playlist by this name doesn't exist"
    }
    if(doc.playlists[playlistName] == undefined
    || doc.playlists[playlistName] == "" 
    || doc.playlists[playlistName] == null){
        return "Playlist by this name doesn't exist"
    }
    doc.playlists[playlistName].splice(index, 1)
    await client.db("DiscordMusicBotDB").collection("Playlist").updateOne({_id:doc._id},{$set:doc})
    return
}

async function deletePlaylist(guildID, playlistName){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("Playlist")
    const doc = await collection.findOne({guildID:guildID})
    if(doc == null){
        return "Playlist by this name doesn't exist"
    }
    if(doc.playlists[playlistName] == undefined
    || doc.playlists[playlistName] == "" 
    || doc.playlists[playlistName] == null){
        return "Playlist by this name doesn't exist"
    }
    delete doc.playlists[playlistName]
    await client.db("DiscordMusicBotDB").collection("Playlist").updateOne({_id:doc._id},{$set:doc})
    return
}

async function getPlaylist(guildID, playlistName){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("Playlist")
    const doc = await collection.findOne({guildID:guildID})
    if(doc == null){
        return "Playlist by this name doesn't exist"
    }
    if(doc.playlists[playlistName] == undefined
    || doc.playlists[playlistName] == "" 
    || doc.playlists[playlistName] == null){
        return "Playlist by this name doesn't exist"
    }
    return doc.playlists[playlistName]
}

async function getAllPlaylistNames(guildID){
    await client.connect()
    const collection = client.db("DiscordMusicBotDB").collection("Playlist")
    const doc = await collection.findOne({guildID:guildID})
    if(doc == null){
        return "There are no playlists in this server"
    }
    if(doc.playlists.length == 0){
        return "There are no playlists in this server"
    }
    const playlistList = Object.keys(doc.playlists)
    return playlistList
}

module.exports = {
    addSong,
    addPlaylist,
    removeSong,
    deletePlaylist,
    getPlaylist,
    getAllPlaylistNames
}