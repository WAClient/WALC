const { app, BrowserWindow, session, Menu, dialog } = require('electron')
const { autoUpdater } = require("electron-updater")
const { Client } = require('whatsapp-web.js');
autoUpdater.checkForUpdatesAndNotify()
var path = require('path')
const dns = require("dns");
const Store = require('electron-store')
const fs = require('fs')

let isConnected = true;
let firstCall = true;
let preventExit = true;

// set user agent manually
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
findID = null;
emptyBody = null;

//Default Settings
var settings = new Store({
    name: 'settings',
    defaults: {
        askOnExit: {
            value: true,
            name: 'Ask on Exit',
            description: 'If enabled, WALC will confirm everytime you want to close it. Default is true.'
        },
        multiInstance: {
            value: false,
            name: 'Allow Multiple Instances',
            description: "It allows you open multiple instances of WALC so you can login to more than one WhatsApp account. It is disabled by default."
        },
        alwaysOnTop: {
            value: false,
            name: 'Always On Top',
            description: 'Allow WALC to always be shown in front of other apps'
        }
    }
})
const settingsMenu = [{
    label: settings.get('askOnExit.name'),
    type: 'checkbox',
    checked: settings.get('askOnExit.value'),
    click: (menuItem, window, e) => {
        settings.set('askOnExit.value', menuItem.checked)
        preventExit = true;
    },
},
{
    label: settings.get('multiInstance.name'),
    type: 'checkbox',
    checked: settings.get('multiInstance.value'),
    click: (menuItem, window, e) => {
        settings.set('multiInstance.value', menuItem.checked)
        preventExit = true;
    },
}
]
const windowMenu = [{
    label: 'Debug Tools',
    role: 'toggleDevTools'
}, {
    label: 'Always On Top',
    type: 'checkbox',
    checked: settings.get('alwaysOnTop.value'),
    click: () => {
        settings.set('alwaysOnTop.value', !windowMenu[1].checked)
        win.setAlwaysOnTop(settings.get('alwaysOnTop.value'))
    }

}, {
    label: 'Zoom',
    type: 'submenu',
    submenu: [{
        label: 'Zoom In',
        role: 'zoomIn',
    }, {
        label: 'Zoom Out',
        role: 'zoomOut',
    }, {
        label: 'Reset Zoom',
        role: 'resetZoom',
    }]
}]
const mainmenu = [{
    label: 'Settings',
    submenu: settingsMenu,
}, {
    label: 'Window',
    submenu: windowMenu,
}]
function loadWA() {
    //Close second instance if multiInstance is disabled
    const multiInstance = settings.get('multiInstance.value')
    const singleLock = app.requestSingleInstanceLock()
    if (!singleLock && !multiInstance) {
        app.quit()
    } else {
        app.on('second-instance', (event, cmdLine, workingDir) => {
            if (!multiInstance && win) {
                if (win.isMinimized()) win.restore()
                win.focus()
            }
        })
    }
    const menubar = Menu.buildFromTemplate(mainmenu)
    Menu.setApplicationMenu(menubar)
    win.setMenuBarVisibility(true);

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
    win.setAlwaysOnTop(settings.get('alwaysOnTop.value'))

    //Hide Default menubar
    win.setMenu(null);

    // and load the Main Page of the app.
    setInterval(function () {
        liveCheck();
    }, 1000);
    loadWA()
    win.setTitle('WALC')

    win.on('close', e => {
        if (settings.get('askOnExit.value') && preventExit) {
            e.preventDefault();
            dialog.showMessageBox(win, {
                type: 'question',
                buttons: ['Yes', 'No'],
                title: 'Exit?',
                message: "Are you sure you want to exit WALC?"
            }, (res) => {
                if (res == 0) {
                    preventExit = false
                    win.close()
                }
            })
        }
    });


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