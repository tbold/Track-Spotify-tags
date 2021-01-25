var rp = require('request-promise');
const dotenv = require("dotenv");
dotenv.config();

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri: 'http://localhost:3000/'
  });

async function sendSearchRequest(key, type) {
    if (type === "Tracks") {
        return spotifyApi.searchTracks(key)
        .then((data) => {
            return data.body.tracks.items;
        }).catch((err) => {
            console.error(err);
            return [];
        });
    } else if (type == "Tags") {
        return spotifyApi.getTrack([key])
        .then((data) => {
            console.log("searching " + key);
            return data.body;
        }).catch((err) => {
            console.error(err);
            return [];
        });
    } 
    else {
        return [];
    }
}

async function getArtistRequest(data) {
    return spotifyApi.getArtists(data.artists)
    .then((data) => {
        console.log(data);
    }).catch((err) => {
        console.error(err);
        return null;
    });
}

async function getCredentials() {
    return spotifyApi.clientCredentialsGrant()
    .then((data) => {
        //   console.log('The access token expires in ' + data.body['expires_in']);
        //   console.log('The access token is ' + data.body['access_token']);
       
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
        }).catch((err) => {
          console.log('Something went wrong when retrieving an access token', err);
        });
}

async function spotify(key, type) {
    return getCredentials().
    then(sendSearchRequest.bind(null, key, type))
    .then((data) => {
        return data;
    }).catch(function (err) {
        console.log(err);
        return [];
    });
  }

module.exports = spotify;
  