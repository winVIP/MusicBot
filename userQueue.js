var servers = new Map();

function add(guildID, userID){
    const guildConfig = require("./ServerSettings/" + guildID + ".json");

    const server = servers.get(guildID);
    if(server != undefined){
        const userSongsInQueue = server.get(userID);
        if(userSongsInQueue < guildConfig["maxUserSongs"]){
            servers.set(guildID, new Map().set(userID, userSongsInQueue + 1));
            return userSongsInQueue + 1;
        }
        else{
            return false;
        }
    }
    else{
        servers.set(guildID, new Map().set(userID, 1));
        return 1;
    }
}
    

function remove(guildID, userID){
    const server = servers.get(guildID);
    if(server != undefined){
        const userSongsInQueue = server.get(userID);
        if(userSongsInQueue > 0){
            servers.set(guildID, new Map().set(userID, userSongsInQueue - 1));
            return userSongsInQueue - 1;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

function deleteGuild(guildID){
    servers.delete(guildID);
}

function get(guildID, userID){
    return servers.get(guildID).get(userID);
}

module.exports = {
    add,
    remove,
    deleteGuild,
    get
}