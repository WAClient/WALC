const { app, BrowserWindow, session } = require('electron')
var path = require('path')

// set user agent manually
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {

    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600, title: 'WhatsApp Linux (unofficial)', icon: path.join(__dirname, 'icons/logo256x256.png') })

    //Prevent windows title from changing
    win.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });

    //Hide Default menubar
    win.setMenu(null);

    // and load the index.html of the app.
    win.loadURL('https://web.whatsapp.com', { 'userAgent': userAgent })

    win.setTitle('WhatsApp Linux (unofficial)')

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        app.shell.openExternal(url);
    })
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})