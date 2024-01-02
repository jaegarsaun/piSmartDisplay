const { ipcRenderer } = require("electron");

// Clock functionality
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  if (hours > 12) {
    hours -= 12;
  }

  if (hours === 0) {
    hours = 12;
  }

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds}`;

  document.getElementById("clock").textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock(); // run function initially to avoid delay

// Spotify access token request

function requestSpotifyToken() {
  ipcRenderer.send("request-spotify-token", "request");
}
setInterval(requestSpotifyToken, 3600000); // run function every hour to refresh token
requestSpotifyToken();

ipcRenderer.on("spotify-token-response", (event, data) => {
  console.log(data); // Process the data as needed
});



// Spotify token functions

let accessToken;
const refreshToken = "AQA-LMUFFGfMdxLasbk3g0s34ELh4jfcGOmNPqWw0F3jm1iUdwFy_7u4ut7tzt0M4cHDF7y9_zpQl49DNf7qdBdoZoP8sq0ahEJdoRLDmCbgDuEc8TtvvpZ0pgQdSQ2Bnfo"
const client_id = "34520f0d8a464e71a3856040ec2dd9df"
const client_secret = "9e513028f65e41919fd210ca01b8906e"

function refreshAccessToken(){
    
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refreshToken;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            accessToken = data.access_token;
        }
        if ( data.refresh_token  != undefined ){
            refreshToken = data.refresh_token;
        }
    
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// Spotify API functions


const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";
function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(body);
    xhr.onload = callback;
}
function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 500);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 500);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}

function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}
setInterval(currentlyPlaying, 5000);
currentlyPlaying(); // run function initially to avoid delay

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        if ( data.item != null ){
            document.getElementById("songCover").src = data.item.album.images[0].url;
            var maxLen = 8;

            var songName = data.item.name;
            if (songName.length > maxLen) {
                songName = songName.substring(0, maxLen) + '...';
            }
            document.getElementById("songName").innerHTML = songName;
            
            var artistName = data.item.artists[0].name;
            if (artistName.length > maxLen) {
                artistName = artistName.substring(0, maxLen) + '...';
            }
            document.getElementById("artistName").innerHTML = artistName;
            
        }else{
            document.getElementById("songCover").src = "";
            document.getElementById("songName").innerHTML = "No song currently playing";
            document.getElementById("artistName").innerHTML = "N/A";
        }

    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

let playPuauseState = "play";
const playPauseBtn = document.getElementById("playPauseBtnIcon");
function setPlayPauseState(){
    if(playPuauseState == "play"){
        playPauseBtn.className = "fa-solid fa-pause controllBtnImg";
        playPuauseState = "pause";
    }
    else{
        playPauseBtn.className = "fa-solid fa-play controllBtnImg";
        playPuauseState = "play";
    }
}
setPlayPauseState();

document.querySelectorAll(".controllBtn").forEach(item => {
    console.log("item" + item.id);
    item.addEventListener("click", event => {
        console.log("item " + item.id + " clicked");
        if (item.id == "playPause") {
            if(playPuauseState == "play"){
                callApi("PUT", PLAY, null, handleApiResponse);
                console.log("play");
                setPlayPauseState();
            }else{
                callApi("PUT", PAUSE, null, handleApiResponse);
                setPlayPauseState();
            }
        }
        else if (item.id == "next") {
            callApi("POST", NEXT, null, handleApiResponse);
            currentlyPlaying();
            if(playPuauseState == "play"){
                setPlayPauseState();
            }
        }
        else if (item.id == "prev") {
            callApi("POST", PREVIOUS, null, handleApiResponse);
            currentlyPlaying();
            if(playPuauseState == "play"){
                setPlayPauseState();
            }
        }
    });
});


