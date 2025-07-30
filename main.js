const { app, BrowserWindow } = require('electron')
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
     webPreferences: {
    preload: path.join(__dirname, 'preload.js'), // <-- Aqui está o preload
    contextIsolation: true,
    nodeIntegration: false,// deve estar false
    sandbox:false 
  }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})
