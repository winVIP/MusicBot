const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const fs = require("fs");
const { get } = require("http");

async function addSong(guildID, playlistName, url){
    const existsResult = fs.existsSync("./playlists/" + guildID + ".json");
    if(existsResult == true){
        const isPlaylist = ytpl.validateID(url);
        if(isPlaylist == true){
            let ytplResult;
            try{
                ytplResult = await ytpl(url, {limit:Infinity});
            }
            catch{
                return "The link is not a valid Youtube link"
            }
            ytplResult = ytplResult.items.map(doc => doc.url);

            const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
            if(Object.keys(currentDoc).includes(playlistName) == true){
                const playlist = currentDoc[playlistName];
                for (let i = 0; i < ytplResult.length; i++) {
                    playlist.push(ytplResult[i]);    
                }
                currentDoc[playlistName] = playlist; 
                fs.writeFileSync("./playlists/" + guildID + ".json",  JSON.stringify(currentDoc, null, 4));
                return `Youtube playlist added to **${playlistName}**`
            }
            else{
                return `Playlist by the name **${playlistName}** doesn't exist, you need to add it with the add command`
            }
        }
        else{
            let ytdlResult;
            try{
                ytdlResult = await ytdl.validateURL(url);
            }
            catch(e){
                console.log(e)
                return "The link is not a valid Youtube link"
            }
            if(ytdlResult == true){
                const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
                if(Object.keys(currentDoc).includes(playlistName) == true){
                    const playlist = currentDoc[playlistName];
                    playlist.push(url);
                    currentDoc[playlistName] = playlist; 
                    fs.writeFileSync("./playlists/" + guildID + ".json",  JSON.stringify(currentDoc, null, 4));
                    return `Youtube song added to **${playlistName}**`
                }
                else{
                    return `Playlist by the name **${playlistName}** doesn't exist, you need to add it with the add command`
                }
            }
            else{
                return "The link is not a valid Youtube link"
            }
        }    
    }
    else{
        return `Playlist by the name **${playlistName}** doesn't exist, you need to add it with the add command`
    }
}

async function addPlaylist(guildID, playlistName){
    const existsResult = fs.existsSync("./playlists/" + guildID + ".json");
    if(existsResult == true){
        const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
        if(Object.keys(currentDoc).includes(playlistName) == true){
            return `Playlist with the name **${playlistName}** already exists`
        }
        else{
            currentDoc[playlistName] = [];
            fs.writeFileSync("./playlists/" + guildID + ".json",  JSON.stringify(currentDoc, null, 4));
            return `Playlist **${playlistName}** was created`
        }
    }
    else{
        let currentDoc = {};
        currentDoc[playlistName] = [];
        fs.writeFileSync("./playlists/" + guildID + ".json",  JSON.stringify(currentDoc, null, 4));
        return `Playlist **${playlistName}** was created`
    }
}

async function removeSong(guildID, playlistName, index){
    const existsResult = fs.existsSync("./playlists/" + guildID + ".json");
    if(existsResult == true){
        const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
        if(Object.keys(currentDoc).includes(playlistName) == true){
            const playlist = currentDoc[playlistName];
            if(playlist.length == 0){
                return `Playlist by the name **${playlistName}** is empty`
            }
            currentDoc[playlistName].splice(index, 1); 
            fs.writeFileSync("./playlists/" + guildID + ".json",  JSON.stringify(currentDoc, null, 4));
            return `Song is removed`
        }
        else{
            return `Playlist by the name **${playlistName}** doesn't exist`
        }
    }
    else{
        return `Playlist by the name **${playlistName}** doesn't exist`
    }
}

async function deletePlaylist(guildID, playlistName){
    const existsResult = fs.existsSync("./playlists/" + guildID + ".json");
    if(existsResult == true){
        const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
        if(Object.keys(currentDoc).includes(playlistName) == true){
            delete currentDoc[playlistName];
            fs.writeFileSync("./playlists/" + guildID + ".json",  JSON.stringify(currentDoc, null, 4));
            return `Playlist by the name **${playlistName}** was removed`
        }
        else{
            return `Playlist by the name **${playlistName}** doesn't exist`
        }
    }
    else{
        return `Playlist by the name **${playlistName}** doesn't exist`
    }
}

async function getPlaylist(guildID, playlistName){
    const existsResult = fs.existsSync("./playlists/" + guildID + ".json");
    if(existsResult == true){
        const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
        if(Object.keys(currentDoc).includes(playlistName) == true){
            const playlist = currentDoc[playlistName];
            if(playlist.length == 0){
                return `Playlist by the name **${playlistName}** is empty`
            }
            return currentDoc[playlistName]
        }
        else{
            return `Playlist by the name **${playlistName}** doesn't exist`
        }
    }
    else{
        return `Playlist by the name **${playlistName}** doesn't exist`
    }
}

async function getAllPlaylistNames(guildID){
    const existsResult = fs.existsSync("./playlists/" + guildID + ".json");
    if(existsResult == true){
        const currentDoc = JSON.parse(fs.readFileSync("./playlists/" + guildID + ".json"));
        if(Object.keys(currentDoc).length > 0){
            return Object.keys(currentDoc);
        }
        else{
            return `There are no playlists on this server`
        }
    }
    else{
        return `There are no playlists on this server`
    }
}

module.exports = {
    addSong,
    addPlaylist,
    removeSong,
    deletePlaylist,
    getPlaylist,
    getAllPlaylistNames
}