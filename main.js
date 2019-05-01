const { app, BrowserWindow, session } = require('electron')
var path = require('path')
const dns = require("dns");
let isConnected = true;
let firstCall = true;

// set user agent manually
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
findID = null;
emptyBody = null;

//Make Single Instance
const singleLock = app.requestSingleInstanceLock()
if(!singleLock) {
    app.quit()
} else {
    app.on('second-instance', (event, cmdLine, workingDir) => {
        if(win) {
            if(win.isMinimized()) win.restore()
            win.focus()
        }
    })
}

function loadWA() {
    win.loadURL('https://web.whatsapp.com', { 'userAgent': userAgent })
    win.webContents.executeJavaScript("Notification.requestPermission(function(p){if(p=='granted'){new Notification('WALC Desktop Notifications', {body:'Desktop Notifications are enabled.', icon:'https://web.whatsapp.com/favicon.ico'});};});")
    win.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });
    win.webContents.on('found-in-page', function (evt, result) {
        if (result.requestId == findID) {
            if (result.matches > 0) {
                win.webContents.executeJavaScript("navigator.serviceWorker.getRegistration().then(function (r) { console.log(r); document.body.style.display='none'; r.unregister().then(function(success){if(success){window.location.reload();}}); });");
            }
        }

    });
    win.webContents.on('did-finish-load', (evt) => {
        findID = win.webContents.findInPage('Update Google Chrome')
    });
}
function liveCheck() {
    dns.resolve("web.whatsapp.com", function (err, addr) {
        if (err) {
            if (isConnected) {
                win.loadURL('file://' + __dirname + '/offline.html');
            }
            isConnected = false;

        } else {
            if (isConnected) {

            }
            else {
                loadWA()
            }

            isConnected = true;
        }
    });
}


function createWindow() {

    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600, title: 'WALC', icon: path.join(__dirname, 'icons/logo256x256.png') })
    win.setMenuBarVisibility(false);
    //Prevent windows title from changing


    //Hide Default menubar
    win.setMenu(null);

    // and load the Main Page of the app.
    setInterval(function () {
        liveCheck();
    }, 1000);
    loadWA()
    win.setTitle('WALC')

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        require('electron').shell.openExternal(url);
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