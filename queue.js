var queue = new Map();
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");

async function addSong(textChannel, voiceChannel, song, guildID, userID, ignoreMaxUserSongs){
    if(queue.has(guildID) == false){
        const queueContruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        const songInfo = await ytdl.getInfo(song);
        const songConstruct = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            skipCount: 0,
            user: userID
        };

        queueContruct.songs.push(songConstruct);

        queue.set(guildID, queueContruct);
        //console.log(que)
        return songConstruct;
    }
    else{
        const guildConfig = require("./ServerSettings/" + guildID + ".json");
        const queueContruct = queue.get(guildID);
        const userSongCount = queueContruct.songs.filter(x => x.user == userID).length;

        if(queueContruct.songs.length >= guildConfig["maxQueueSize"] && guildConfig["maxQueueSize"] != -1){
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
                user: userID
            };

            queueContruct.songs.push(songConstruct);

            queue.set(guildID, queueContruct);
            return songConstruct;
        }
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
            queue.delete(guildID);
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
    if(queue.has(guildID) == false){
        return "The queue is empty"
    }
    else{
        queue.delete(guildID);
        return "The queue is now empty"
    }
}

async function getSongToPlay(guildID){
    if(queue.has(guildID) == false){
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
    voteSkip
}