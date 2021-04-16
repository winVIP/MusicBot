var queue = new Map();
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr")
const scdl = require("soundcloud-downloader").default;

var lastSongPlayed = new Map();

async function addSong(textChannel, voiceChannel, song, guildID, userID, ignoreMaxUserSongs){
    const isPlaylist = ytpl.validateID(song);
    let ytplResult;
    if(isPlaylist == true){
        ytplResult = await ytpl(song, {limit:Infinity});
        ytplResult = ytplResult.items;
    }


    if(queue.has(guildID) == false){
        const queueConstruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        if(isPlaylist == true){
            const userSongCount = queueConstruct.songs.filter(x => x.user == userID).length;
            if(queueConstruct.songs.length + ytplResult.length > guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
                const slotsLeft = guildConfig["maxQueueSize"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in queue`;
                }
            }
            else if(userSongCount + ytplResult.length > guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
                const slotsLeft = guildConfig["maxUserSongs"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in user queue`;
                }
            }
            for (let i = 0; i < ytplResult.length; i++) {
                const songConstruct = {
                    title: ytplResult[i].title,
                    url: ytplResult[i].url,
                    skipCount: 0,
                    user: userID,
                    platform: "youtube"
                };

                queueConstruct.songs.push(songConstruct);                
            }
        }
        else{
            const songInfo = await ytdl.getInfo(song);
            const songConstruct = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                skipCount: 0,
                user: userID,
                platform: "youtube"
            };

            queueConstruct.songs.push(songConstruct);
        }

        queue.set(guildID, queueConstruct);

        return await getSongToPlay(guildID);
    }
    else{
        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        const queueConstruct = queue.get(guildID);
        const userSongCount = queueConstruct.songs.filter(x => x.user == userID).length;

        if(isPlaylist == true){
            if(queueConstruct.songs.length + ytplResult.length > guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
                const slotsLeft = guildConfig["maxQueueSize"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in queue`;
                }
            }
            else if(userSongCount + ytplResult.length > guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
                const slotsLeft = guildConfig["maxUserSongs"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in user queue`;
                }
            }
            else{
                for (let i = 0; i < ytplResult.length; i++) {
                    const songConstruct = {
                        title: ytplResult[i].title,
                        url: ytplResult[i].url,
                        skipCount: 0,
                        user: userID,
                        platform: "youtube"
                    };
    
                    queueConstruct.songs.push(songConstruct);                
                }

                queue.set(guildID, queueConstruct);

                return await getSongToPlay(guildID);
            }
        }

        if(queueConstruct.songs.length >= guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
            return "Queue is full";
        }
        else if(userSongCount >= guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
            return "You have reached the maximum amount of song that a user can add to the queue";
        }
        else{
            const songInfo = await ytdl.getInfo(song);
            const songConstruct = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                skipCount: [],
                user: userID,
                platform: "youtube"
            };

            queueConstruct.songs.push(songConstruct);

            queue.set(guildID, queueConstruct);

            return songConstruct;
        }
    }
}

/**
 * 
 * @param {*} textChannel 
 * @param {*} voiceChannel 
 * @param {Array} songs 
 * @param {*} guildID 
 * @param {*} userID 
 * @param {*} ignoreMaxUserSongs 
 * @returns 
 */
async function addSpotifySongs(textChannel, voiceChannel, songs, guildID, userID, ignoreMaxUserSongs){
    if(queue.has(guildID) == false){
        const queueConstruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        if(songs.length > 1){
            const userSongCount = queueConstruct.songs.filter(x => x.user == userID).length;
            if(queueConstruct.songs.length + songs.length > guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
                const slotsLeft = guildConfig["maxQueueSize"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in queue`;
                }
            }
            else if(userSongCount + songs.length > guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
                const slotsLeft = guildConfig["maxUserSongs"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in user queue`;
                }
            }
            for (let i = 0; i < songs.length; i++) {
                let songSearchQuery = "";
                for (let j = 0; j < songs[i].artists.length; j++) {
                    songSearchQuery = songSearchQuery + songs[i].artists[j]                    
                }
                songSearchQuery = songSearchQuery + songs[i].trackName;
                const songSearchResult = await ytsr(songSearchQuery, {limit:1})
                if(songSearchResult.items[0].type == "video"){
                    const songConstruct = {
                        title: songSearchResult.items[0].title,
                        url: songSearchResult.items[0].url,
                        skipCount: 0,
                        user: userID,
                        platform: "youtube"
                    };
    
                    queueConstruct.songs.push(songConstruct); 
                }
            }
        }
        else{
            let songSearchQuery = "";
            for (let j = 0; j < songs[0].artists.length; j++) {
                songSearchQuery = songSearchQuery + songs[0].artists[j]                    
            }
            songSearchQuery = songSearchQuery + songs[0].trackName;
            const songSearchResult = await ytsr(songSearchQuery, {limit:1})
            if(songSearchResult.items[0].type == "video"){
                const songConstruct = {
                    title: songSearchResult.items[0].title,
                    url: songSearchResult.items[0].url,
                    skipCount: 0,
                    user: userID,
                    platform: "youtube"
                };

                queueConstruct.songs.push(songConstruct); 
            }
        }

        queue.set(guildID, queueConstruct);

        return await getSongToPlay(guildID);
    }
    else{
        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        const queueConstruct = queue.get(guildID);

        if(songs.length > 1){
            const userSongCount = queueConstruct.songs.filter(x => x.user == userID).length;
            if(queueConstruct.songs.length + songs.length > guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
                const slotsLeft = guildConfig["maxQueueSize"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in queue`;
                }
            }
            else if(userSongCount + songs.length > guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
                const slotsLeft = guildConfig["maxUserSongs"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in user queue`;
                }
            }
            for (let i = 0; i < songs.length; i++) {
                let songSearchQuery = "";
                for (let j = 0; j < songs[i].artists.length; j++) {
                    songSearchQuery = songSearchQuery + songs[i].artists[j]                    
                }
                songSearchQuery = songSearchQuery + songs[i].trackName;
                const songSearchResult = await ytsr(songSearchQuery, {limit:1})
                if(songSearchResult.items[0].type == "video"){
                    const songConstruct = {
                        title: songSearchResult.items[0].title,
                        url: songSearchResult.items[0].url,
                        skipCount: 0,
                        user: userID,
                        platform: "youtube"
                    };
    
                    queueConstruct.songs.push(songConstruct); 
                }
            }
        }
        else{
            let songSearchQuery = "";
            for (let j = 0; j < songs[i].artists.length; j++) {
                songSearchQuery = songSearchQuery + songs[i].artists[j]                    
            }
            songSearchQuery = songSearchQuery + songs[i].trackName;
            const songSearchResult = await ytsr(songSearchQuery, {limit:1})
            if(songSearchResult.items[0].type == "video"){
                const songConstruct = {
                    title: songSearchResult.items[0].title,
                    url: songSearchResult.items[0].url,
                    skipCount: 0,
                    user: userID,
                    platform: "youtube"
                };

                queueConstruct.songs.push(songConstruct); 
            }
        }

        queue.set(guildID, queueConstruct);

        return await getSongToPlay(guildID);
    }
}

/**
 * 
 * @param {*} textChannel 
 * @param {*} voiceChannel 
 * @param {import("soundcloud-downloader/src/info").TrackInfo[]} scURLs 
 * @param {*} guildID 
 * @param {*} userID 
 * @param {*} ignoreMaxUserSongs 
 * @returns 
 */
async function addSoundCloudSongs(textChannel, voiceChannel, scURLs, guildID, userID, ignoreMaxUserSongs){
    if(queue.has(guildID) == false){
        const queueConstruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        if(scURLs.length > 1){
            const userSongCount = queueConstruct.songs.filter(x => x.user == userID).length;
            if(queueConstruct.songs.length + scURLs.length > guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
                const slotsLeft = guildConfig["maxQueueSize"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in queue`;
                }
            }
            else if(userSongCount + scURLs.length > guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
                const slotsLeft = guildConfig["maxUserSongs"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in user queue`;
                }
            }
            for (let i = 0; i < scURLs.length; i++) {
                const songConstruct = {
                    title: scURLs[i].title,
                    url: scURLs[i].permalink_url,
                    skipCount: 0,
                    user: userID,
                    platform: "soundcloud"
                };

                queueConstruct.songs.push(songConstruct); 
            }
        }
        else{
            const songConstruct = {
                title: scURLs[0].title,
                url: scURLs[0].permalink_url,
                skipCount: 0,
                user: userID,
                platform: "soundcloud"
            };

            queueConstruct.songs.push(songConstruct); 
        }

        queue.set(guildID, queueConstruct);

        return await getSongToPlay(guildID);
    }
    else{
        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        const queueConstruct = queue.get(guildID);

        if(scURLs.length > 1){
            const userSongCount = queueConstruct.songs.filter(x => x.user == userID).length;
            if(queueConstruct.songs.length + songs.length > guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
                const slotsLeft = guildConfig["maxQueueSize"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in queue`;
                }
            }
            else if(userSongCount + songs.length > guildConfig["maxUserSongs"] && guildConfig["maxUserSongs"] != -1 && ignoreMaxUserSongs == false){
                const slotsLeft = guildConfig["maxUserSongs"] - queueConstruct.songs.length;
                if(slotsLeft == 0){
                    return "Queue is full";
                }
                else{
                    return `You can't add that many songs, only ${slotsLeft} slots left in user queue`;
                }
            }
            else{
                for (let i = 0; i < scURLs.length; i++) {
                    const songConstruct = {
                        title: scURLs[i].title,
                        url: scURLs[i].permalink_url,
                        skipCount: 0,
                        user: userID,
                        platform: "soundcloud"
                    };
    
                    queueConstruct.songs.push(songConstruct); 
                }
            }            
        }
        else{
            const songConstruct = {
                title: scURLs[0].title,
                url: scURLs[0].permalink_url,
                skipCount: 0,
                user: userID,
                platform: "soundcloud"
            };

            queueConstruct.songs.push(songConstruct); 
        }

        queue.set(guildID, queueConstruct);

        return await getSongToPlay(guildID);
    }
}

async function removeSong(songIndex, guildID){
    if(songIndex < 1){
        return "The provided index is less than 1";
    }
    else if(Number.isInteger(songIndex) == false){
        return "The index of the song must be an integer";
    }
    else if(queue.has(guildID) == false){
        return "No songs in queue";
    }
    else{
        let queueContruct = queue.get(guildID);
        const removedSong = queueContruct.songs[songIndex - 1].title;
        queueContruct.songs.splice(songIndex - 1, 1);

        if(queueContruct.songs.length == 0){
            queue.set(guildID, queueContruct);
            return "The queue is now empty"
        }
        else{
            queue.set(guildID, queueContruct);
            return `Song has been removed from the queue:\n**${removedSong}**` 
        }
    }
}

async function getUserSongCount(guildID, userID){
    const queueContruct = queue.get(guildID);
    const userSongCount = queueContruct.songs.filter(x => x.user == userID).length;
    return userSongCount;
}

async function getServerSongCount(guildID){
    if(queue.get(guildID) == undefined){
        return 0;
    }
    const queueContruct = queue.get(guildID);
    return queueContruct.songs.length;
}

async function getSongList(guildID){
    if(queue.has(guildID) == false){
        return "The queue is empty";
    }
    else{
        const queueContruct = queue.get(guildID);
        const songs = queueContruct.songs;
        let songTitleList = "";
        for (let i = 0; i < songs.length; i++) {
            if(i == songs.length - 1){
                songTitleList = songTitleList + (i + 1) + ". " + songs[i].title;
            }
            else{
                songTitleList = songTitleList + (i + 1) + ". " + songs[i].title + "\n";
            }
        }
        return songTitleList
    }
}

async function clearQueue(guildID){
    let queueContruct = queue.get(guildID);
    queueContruct.songs = [queueContruct.songs[0]];
    if(queue.has(guildID) == false){
        return "The queue is empty"
    }
    else{
        queue.set(guildID, queueContruct);
        return "The queue is now empty"
    }
}

async function destroyQueue(guildID){
    return queue.delete(guildID);
}

async function getSongToPlay(guildID){
    if(queue.get(guildID).songs.length == 0){
        return "The queue is empty";
    }
    else{
        const queueContruct = queue.get(guildID);
        return queueContruct.songs[0];
    }
}

async function isEmpty(guildID){
    if(queue.has(guildID) == false){
        return true;
    }
    else{
        return false;
    }
}

async function addConnection(guildID, connection){
    if(queue.has(guildID) == false){
        return "The queue is empty"
    }
    let queueContruct = queue.get(guildID);
    queueContruct.connection = connection;
    queue.set(guildID, queueContruct);
    return "Connection added";
}

async function getConnection(guildID){
    if(queue.has(guildID) == false){
        return "The queue is empty";
    }
    if(queue.get(guildID).connection == null){
        return "No connection added";
    }
    return queue.get(guildID).connection;
}

async function voteSkip(guildID, memberID, usersInChannel){
    const guildConfig = require("./ServerSettings/" + guildID + ".json");
    if(guildConfig.usersNeededToSkip == -1){
        return "skip"
    }
    else{
        const skipCount = queue.get(guildID).songs[0].skipCount;
        if(skipCount.length == 0){
            let usersNeededToSkipCount = usersInChannel / 100 * guildConfig.usersNeededToSkip;
            usersNeededToSkipCount = Math.ceil(usersNeededToSkipCount);
            if(skipCount + 1 >= usersNeededToSkipCount){
                return "skip";
            }
            else{
                const queueContruct = queue.get(guildID);
                queueContruct.songs[0].skipCount.push(memberID);
                queue.set(guildID, queueContruct);
                return queueContruct.songs[0].skipCount;
            }
        }
        else{
            if(queue.get(guildID).songs.includes(memberID)){
                return "sameUser"
            }
            else{
                let usersNeededToSkipCount = usersInChannel / 100 * guildConfig.usersNeededToSkip;
                usersNeededToSkipCount = Math.ceil(usersNeededToSkipCount);
                if(skipCount + 1 >= usersNeededToSkipCount){
                    return "skip";
                }
                else{
                    const queueContruct = queue.get(guildID);
                    queueContruct.songs[0].skipCount.push(memberID);
                    queue.set(guildID, queueContruct);
                    return queueContruct.songs[0].skipCount;
                }
            }    
        }        
    }    
}

async function shuffle(guildID){
    let queueConstruct = queue.get(guildID)
    let songArray = queueConstruct.songs.slice(1, queueConstruct.songs.length);
    console.log(songArray)

    let currentIndex = songArray.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = songArray[currentIndex];
        songArray[currentIndex] = songArray[randomIndex];
        songArray[randomIndex] = temporaryValue;
    }

    songArray.unshift(queueConstruct.songs[0]);

    queueConstruct.songs = songArray;
    queue.set(guildID, queueConstruct);

    return;
}

async function getLastSongPlayed(guildID){
    return lastSongPlayed.get(guildID)
}

async function setLastSongPlayed(guildID, songConstruct){
    lastSongPlayed.set(guildID, songConstruct);
    return;
}

/* const method = async () => {
    const a1 = await addSong("sadasd", "dsadasda", "https://www.youtube.com/watch?v=YrcyW38bUVI", "803958160502030367", "dasdsad");
    const a2 = await addSong("sadasd", "dsadasda", "https://www.youtube.com/watch?v=YrcyW38bUVI", "803958160502030367", "dasdsad");
    const a3 = await addSong("sadasd", "dsadasda", "https://www.youtube.com/watch?v=YrcyW38bUVI", "803958160502030367", "dasdsad");
    const a4 = await addSong("sadasd", "dsadasda", "https://www.youtube.com/watch?v=YrcyW38bUVI", "803958160502030367", "dasdsad");
    console.log(a1);
    console.log(a2);
    console.log(a3);
    console.log(a4);
    const a5 = await removeSong(1, "803958160502030367");
    console.log(a5);
    console.log(await getUserSongCount("803958160502030367", "dasdsad"))
    console.log(await getServerSongCount("803958160502030367"))
    console.log(await getSongList("803958160502030367"));
    console.log(await getSongToPlay("803958160502030367"));
    console.log(await clearQueue("803958160502030367"));
    console.log(queue);
}
method(); */

module.exports = {
    addSong,
    removeSong,
    getUserSongCount,
    getServerSongCount,
    getSongList,
    clearQueue,
    getSongToPlay,
    isEmpty,
    addConnection,
    getConnection,
    voteSkip,
    shuffle,
    getLastSongPlayed,
    setLastSongPlayed,
    addSpotifySongs,
    destroyQueue,
    addSoundCloudSongs
}