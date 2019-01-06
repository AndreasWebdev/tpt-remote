const {app, BrowserWindow} = require('electron');
let window;

function createWindow () {
    window = new BrowserWindow({
        width: 1280,
        height: 720,
        resizable: false,
        maximizable: false});
    window.loadFile('app/index.html')
}

app.on('ready', createWindow);