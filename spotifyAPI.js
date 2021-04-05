var SpotifyWebApi = require('spotify-web-api-node');
const configs = require("./config.json")

async function getQueries(url){
    const spotifyID = await parseSpotifyLink(url);
    let data;
    if(spotifyID[0] == "artist"){
        data = await getArtist(spotifyID[1]);
    }
    else if(spotifyID[0] == "album"){
        data = await getAlbum(spotifyID[1]);
    }
    else if(spotifyID[0] == "playlist"){
        data = await getPlaylist(spotifyID[1]);
    }
    else if(spotifyID[0] == "track"){
        data = await getTrack(spotifyID[1]);
    }
    else{
        data = false
    }
    return data
}

async function parseSpotifyLink(link){
    if(link.startsWith("http") == true){
        if(link.includes("artist") == true){
            return ["artist", link.split("artist/")[1].split("?")[0]] 
        }
        else if(link.includes("album") == true){
            return ["album", link.split("album/")[1].split("?")[0]]
        }
        else if(link.includes("playlist") == true){
            return ["playlist", link.split("playlist/")[1].split("?")[0]]
        }
        else if(link.includes("show") == true){
            return ["show", link.split("show/")[1].split("?")[0]]
        }
        else if(link.includes("episode") == true){
            return ["episode", link.split("episode/")[1].split("?")[0]]
        }
        else if(link.includes("track") == true){
            return ["track", link.split("track/")[1].split("?")[0]]
        }
        else{
            return false
        }
    }
    else if(link.startsWith("spotify") == true){
        if(link.includes("artist") == true){
            return ["artist", link.split("artist:")[1]]
        }
        else if(link.includes("album") == true){
            return ["album", link.split("album:")[1]]
        }
        else if(link.includes("playlist") == true){
            return ["playlist", link.split("playlist:")[1]]
        }
        else if(link.includes("show") == true){
            return ["show", link.split("show:")[1]]
        }
        else if(link.includes("episode") == true){
            return ["episode", link.split("episode:")[1]]
        }
        else if(link.includes("track") == true){
            return ["track", link.split("track:")[1]]
        }
        else{
            return false
        }
    }
    else{
        return false
    }
}

async function getArtist(spotifyID){
    var spotifyApi = new SpotifyWebApi({
        clientId: configs.SpotifyClientId,
        clientSecret: configs.SpotifyClientSecret
    });

    const response = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(response.body["access_token"])
    try{
        const artist = await spotifyApi.getArtist(spotifyID);
        let albums = await spotifyApi.getArtistAlbums(spotifyID);
        albums = albums.body.items;
        //console.log(albums)
        let tracks = [];
        for (let i = 0; i < albums.length; i++) {
            let albumTracks = await spotifyApi.getAlbumTracks(albums[i].id)
            albumTracks = albumTracks.body.items
            tracks = tracks.concat(albumTracks)         
        }
        const trackTitles = []
        for (let i = 0; i < tracks.length; i++) {
            let trackArtists = [];
            for (let j = 0; j < tracks[i].artists.length; j++) {
                trackArtists.push(tracks[i].artists[j].name)
            }
            if(trackArtists.includes(artist.body.name) == true){
                trackTitles.push({
                    artists: trackArtists, 
                    trackName: tracks[i].name
                })
            }
        }
        return trackTitles;
    }
    catch{
        return false
    }
}

async function getAlbum(spotifyID){
    var spotifyApi = new SpotifyWebApi({
        clientId: configs.SpotifyClientId,
        clientSecret: configs.SpotifyClientSecret
    });

    const response = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(response.body["access_token"])
    try{
        const albumTracks = await spotifyApi.getAlbumTracks(spotifyID);
        const tracks = albumTracks.body.items;
        const trackTitles = []
        for (let i = 0; i < tracks.length; i++) {
            let trackArtists = [];
            for (let j = 0; j < tracks[i].artists.length; j++) {
                trackArtists.push(tracks[i].artists[j].name)
            }
            trackTitles.push({
                artists: trackArtists, 
                trackName: tracks[i].name
            })
        }
        return trackTitles;
    }
    catch{
        return false
    }
}

async function getPlaylist(spotifyID){
    var spotifyApi = new SpotifyWebApi({
        clientId: configs.SpotifyClientId,
        clientSecret: configs.SpotifyClientSecret
    });

    const response = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(response.body["access_token"])
    try{
        const playlistTracks = await spotifyApi.getPlaylistTracks(spotifyID);
        const tracks = playlistTracks.body.items.map(item => item.track);
        const trackTitles = []
        for (let i = 0; i < tracks.length; i++) {
            let trackArtists = [];
            for (let j = 0; j < tracks[i].artists.length; j++) {
                trackArtists.push(tracks[i].artists[j].name)
            }
            trackTitles.push({
                artists: trackArtists, 
                trackName: tracks[i].name
            })
        }
        return trackTitles;
    }
    catch(e){
        console.log(e)
        return false
    }
}

async function getTrack(spotifyID){
    var spotifyApi = new SpotifyWebApi({
        clientId: configs.SpotifyClientId,
        clientSecret: configs.SpotifyClientSecret
    });

    const response = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(response.body["access_token"])
    try{
        const track = await spotifyApi.getTrack(spotifyID);
        const trackName = track.body.name
        let trackArtists = [];
        for (let i = 0; i < track.body.artists.length; i++) {
            trackArtists.push(track.body.artists[i].name)
        }
        return [{
            artists: trackArtists, 
            trackName: trackName
        }]
    }
    catch{
        return false
    }
}

module.exports = {
    getQueries
}