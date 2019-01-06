var TwitchJS = require('twitch-js');

// Settings
const token = "oauth:7vizzvjrdpg50qnwd7hfs8mi5m8rwt";
const username = "iKlikla";
const channel = '#twitchplaystomodachi';

const options = {
    channels: [channel],
    identity: {
      username: username,
      password: token
    },
};

const client = new TwitchJS.client(options);

// UI
const uiChat = document.querySelector(".chat");
const uiOverlay = document.querySelector(".iframe-overlay");
const uiOverlayBottomScreen = document.querySelector(".iframe-overlay .bottom-screen");

// Overlays
let isOverlayActive = true;

// Touches and Moves
let dragStartX = 0;
let dragStartY = 0;
let dragEndX = 0;
let dragEndY = 0;

uiOverlay.addEventListener('mousedown', function(event) {
    dragStartX = event.offsetX;
    dragStartY = event.offsetY;
});

uiOverlay.addEventListener('mouseup', function(event) {
    dragEndX = event.offsetX;
    dragEndY = event.offsetY;

    TouchDrag(dragStartX, dragStartY, dragEndX, dragEndY);
});

function TouchDrag(dSx, dSy, dEx, dEy) {
    if(dSx === dEx && dSy === dEy) {
        console.log("Touch (" + OverlayToStreamCoords(dEx, true) + "," +  OverlayToStreamCoords(dEy, false) + ")");
        client.say(channel, "touch " + OverlayToStreamCoords(dEx, true) + " " + OverlayToStreamCoords(dEy, false));
    } else {
        console.log("Drag from (" + dSx + "," + dSy + ") to (" + dEx + "," + dEy + ")!");
        client.say(channel, "touch " + OverlayToStreamCoords(dSx, true) + " " + OverlayToStreamCoords(dSy, false) + " " + OverlayToStreamCoords(dEx, true) + " " + OverlayToStreamCoords(dEy, false));
    }

}

function OverlayToStreamCoords(coord, isX) {
    let overlayCoord;
    let streamMax;
    let overlayFactor;

    if(isX) {
        // X
        overlayCoord = uiOverlayBottomScreen.offsetWidth;
        streamMax = 320;

    } else {
        // Y
        overlayCoord = uiOverlayBottomScreen.offsetHeight;
        streamMax = 240;
    }

    overlayFactor = streamMax / overlayCoord;

    return Math.round(coord * overlayFactor);
}

// Write
const uiWriteText = document.querySelector(".textContent");
const uiChatButton = document.querySelector(".chatText");
const uiWriteButton = document.querySelector(".writeText");
uiChatButton.addEventListener('click', function(e) {
    e.preventDefault();
    client.say(channel, uiWriteText.value);
    uiWriteText.value = "";
});
uiWriteButton.addEventListener('click', function(e) {
    e.preventDefault();
    WriteTextToStream(uiWriteText.value);
    uiWriteText.value = "";
});

function WriteTextToStream(text) {
    let i = 0;
    let intervalId = 0;

    intervalId = setInterval(function() {
        WriteLetterToStream(text.charAt(i++));

        if(i + 1 > text.length) {
            clearInterval(intervalId);
        }
    }, 1800);
}

function WriteLetterToStream(letter) {
    let letterDictionary = new Array();
    letterDictionary["a"] = [0,0,0,0];

    client.say(channel, letter);
}

function uiAddNotice(noticeText) {
    console.log(noticeText);

    var newNotice = document.createElement("div");
    newNotice.classList.add("notice");
    newNotice.innerHTML = noticeText;

    uiChat.appendChild(newNotice);
}

function uiAddMessage(userstate, message) {
    var newMessage = document.createElement("div");
    newMessage.classList.add("message");

    var newMessageUsername = document.createElement("div");
    newMessageUsername.classList.add("username");
    newMessageUsername.style.color = userstate['color'];
    newMessageUsername.innerHTML = userstate['display-name'];

    var newMessageText = document.createElement("div");
    newMessageText.classList.add("text");
    newMessageText.innerHTML = message;

    newMessage.appendChild(newMessageUsername);
    newMessage.appendChild(newMessageText);

    uiChat.appendChild(newMessage);
}

// Chat IRC
client.on('connecting', () => {
    uiAddNotice("Connecting to chat...");
});

client.on('connectionfail', (reason) => {
    uiAddNotice("Couldn't connect to chat! Reason: " + reason);
});

client.on('connected', () => {
    uiAddNotice("Connected to chat!");
});

client.on('disconnected', () => {
    uiAddNotice("Disconnected from chat!");
});

client.on('chat', (channel, userstate, message) => {
    uiAddMessage(userstate, message);
});

client.connect();