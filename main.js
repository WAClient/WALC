const { app, BrowserWindow, session, Menu, dialog, Tray, remote } = require('electron');
const { autoUpdater } = require("electron-updater");
const { Client } = require('./WhatsBot/index');
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
autoUpdater.checkForUpdatesAndNotify();
var path = require('path');
const dns = require("dns");
const Store = require('electron-store');
const fs = require('fs');
const getPortSync = require('get-port-sync');
const createDesktopShortcut = require('create-desktop-shortcuts');
const homedir = require('os').homedir();


var trayIcon;
let isConnected = true;
let firstCall = true;
let preventExit = true;

let pieBrowser;
let botClient;

let customeTitle = "WALC";

let preventTitleChange = true;

// set user agent manually
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36';
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
findID = null;
emptyBody = null;

let freePort = null;
try {
    freePort = getPortSync();
    pie.initialize(app, freePort);
}
catch (e) { console.log(e); }

const shortcutDir = path.join(homedir, ".local/share/applications");
//Create Desktop Shortcut for AppImage
function integrateToDesktop(win) {
    const iconDir = path.join(homedir, ".local/share/WALC");
    const iconPath = path.join(iconDir, "logo256x56.png");
    fs.mkdirSync(shortcutDir, { recursive: true });
    fs.mkdirSync(iconDir, { recursive: true });
    fs.copyFileSync(path.join(__dirname, "icons/logo256x256.png"), iconPath);
    const shortcutCreated = createDesktopShortcut({
        onlyCurrentOS: true,
        customLogger: (msg, error) => {
            dialog.showMessageBoxSync(win, {
                type: 'error',
                buttons: ['OK'],
                title: 'Desktop Integration',
                message: msg
            });
        },
        "linux": {
            filePath: process.env.APPIMAGE,
            outputPath: shortcutDir,
            name: 'WALC',
            description: 'WALC - unofficial WhatsApp Linux Client',
            icon: iconPath,
            type: 'Application',
            terminal: false,
            chmod: true
        }
    });
    if(shortcutCreated) {
        dialog.showMessageBoxSync(win, {
            type: 'info',
            buttons: ['OK'],
            title: 'Desktop Integration',
            message: "WALC has successfully been integrated to your Applications."
        });
    }
}


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
        },
        closeToTray: {
            value: false,
            name: 'Close to Tray',
            description: 'If enabled, WALC will be hidden everytime you want to close it. Default is false.'
        },
        startHidden: {
            value: false,
            name: 'Start Hidden',
            description: 'Hide WALC on startup'
        },
    }
});

const settingsMenu = [{
    label: settings.get('askOnExit.name'),
    type: 'checkbox',
    checked: settings.get('askOnExit.value'),
    click: (menuItem, window, e) => {
        settings.set('askOnExit.value', menuItem.checked);
        preventExit = true;
    },
}, {
    label: settings.get('multiInstance.name'),
    type: 'checkbox',
    checked: settings.get('multiInstance.value'),
    click: (menuItem, window, e) => {
        settings.set('multiInstance.value', menuItem.checked);
        preventExit = true;
    },
}, {
    label: settings.get('closeToTray.name'),
    type: 'checkbox',
    checked: settings.get('closeToTray.value'),
    click: (menuItem) => {
        settings.set('closeToTray.value', menuItem.checked);
    }
}, {
    label: settings.get('startHidden.name'),
    type: 'checkbox',
    checked: settings.get('startHidden.value'),
    click: (menuItem) => {
        settings.set('startHidden.value', menuItem.checked);
    }
}, {
    label: "Update Desktop Integration",
    type: 'normal',
    checked: settings.get('multiInstance.value'),
    click: (menuItem, window, e) => {
        integrateToDesktop(window);
    },
    visible: process.env.APPIMAGE !== undefined
}];
const windowMenu = [{
    label: 'Debug Tools',
    role: 'toggleDevTools'
}, {
    label: 'Always On Top',
    type: 'checkbox',
    checked: settings.get('alwaysOnTop.value'),
    click: (menuItem) => {
        settings.set('alwaysOnTop.value', menuItem.checked);
        win.setAlwaysOnTop(menuItem.checked);
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
}, {
    label: 'Exit',
    type: 'normal',
    click: () => {
        app.isQuiting = true;
        app.quit();
    },
}];
const mainmenu = [{
    label: 'Settings',
    submenu: settingsMenu,
}, {
    label: 'Window',
    submenu: windowMenu,
}];

function toggleVisibility() {
    if(win.isVisible()) win.hide();
    else win.show();
    trayIcon.setContextMenu(Menu.buildFromTemplate(getTrayMenu()));
}

function getTrayMenu() {
    let visibilityLabel = (win.isVisible() ? 'Hide' : 'Show') + ' WALC';
    return [{
        label: visibilityLabel,
        click: toggleVisibility
    }, {
        label: 'Quit',
        click: function () {
            preventExit = false;
            app.isQuiting = true;
            app.quit();
        }
    }];
}

function loadWA() {
    //Close second instance if multiInstance is disabled
    const multiInstance = settings.get('multiInstance.value');
    const singleLock = app.requestSingleInstanceLock();
    if (!singleLock && !multiInstance) {
        win = null;
        app.quit();
        process.exit(0);
        return;
    } else {
        app.on('second-instance', (event, cmdLine, workingDir) => {
            if (!multiInstance && win) {
                if (win.isMinimized()) win.restore();
                win.focus();
            }
        });
    }
    const menubar = Menu.buildFromTemplate(mainmenu);
    Menu.setApplicationMenu(menubar);
    win.setMenuBarVisibility(true);
    win.loadURL('https://web.whatsapp.com', { 'userAgent': userAgent }).then(async () => {
        pie.connect(app, puppeteer).then(async (b) => {
            pieBrowser = b;
            let page;
            try {
                page = await pie.getPage(pieBrowser, win);
            }
            catch (e) {
                // return
                console.log(e);
            }
            const KEEP_PHONE_CONNECTED_IMG_SELECTOR = '[data-asset-intro-image="true"]';
            await page.waitForSelector(KEEP_PHONE_CONNECTED_IMG_SELECTOR, { timeout: 0 });
            botClient = new Client();
            botClient.initialize(page, win);
            if (firstCall) {
                firstCall = false;
                win.webContents.executeJavaScript("Notification.requestPermission(function(p){if(p=='granted'){new Notification('WALC Desktop Notifications', {body:'Desktop Notifications are enabled.', icon:'https://web.whatsapp.com/favicon.ico'});};});");
                botClient.on('message', (msg) => {
                    console.log(msg.body);
                });
                botClient.on('ready', () => {
                    customeTitle = `${botClient.info.me.user} - WALC`;
                    preventTitleChange = false;
                    win.setTitle(customeTitle);
                    preventTitleChange = true;
                });

            }
        }).catch((err) => {

        });

    });

    win.on('page-title-updated', (evt) => {
        if (preventTitleChange) {
            evt.preventDefault();
            preventTitleChange = false;
            win.setTitle(customeTitle);
            preventTitleChange = true;
        }

    });
    win.webContents.on('found-in-page', function (evt, result) {
        if (result.requestId == findID) {
            if (result.matches > 0) {
                //win.webContents.executeJavaScript("navigator.serviceWorker.getRegistration().then(function (r) { console.log(r); document.body.style.display='none'; r.unregister().then(function(success){if(success){window.location.reload();}}); });");
                win.webContents.session.clearStorageData({ storages: ["serviceWorkers"] }).then(() => {
                    loadWA();
                }).catch((err) => {
                    //console.log(err)
                });

            }
        }

    });
    win.webContents.on('did-finish-load', (evt) => {
        findID = win.webContents.findInPage('Update Google Chrome');

    });
}
function liveCheck() {
    dns.resolve("web.whatsapp.com", function (err, addr) {
        if (err) {
            if (isConnected) {
                win.loadFile('offline.html');
                delete botClient;
            }
            isConnected = false;

        } else {
            if (isConnected) {

            }
            else {
                loadWA();
            }

            isConnected = true;
        }
    });
}

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'WALC',
        icon: path.join(__dirname, 'icons/logo256x256.png'),
        'webPreferences': { 'nodeIntegration': true },
        show: !settings.get('startHidden.value'),
    });
    win.setMenuBarVisibility(false);
    win.setAlwaysOnTop(settings.get('alwaysOnTop.value'));
    trayIcon = new Tray(path.join(__dirname, 'icons/logo256x256.png'));
    //Hide Default menubar
    win.setMenu(null);

    // and load the Main Page of the app.
    setInterval(function () {
        liveCheck();
    }, 1000);
    if (isConnected) {
        loadWA();
    }
    win.setTitle('WALC');
    trayIcon.setTitle('WALC');
    trayIcon.setToolTip('WALC');
    trayIcon.on('click', toggleVisibility);

    trayIcon.setContextMenu(Menu.buildFromTemplate(getTrayMenu()));


    win.on('close', e => {
        e.preventDefault();
        if (settings.get('closeToTray.value') && !app.isQuiting) {
            toggleVisibility();
        } else if (settings.get('askOnExit.value') && preventExit) {
            res = dialog.showMessageBoxSync(win, {
                type: 'question',
                buttons: ['Yes', 'No'],
                title: 'Exit?',
                message: "Are you sure you want to exit WALC?"
            });
            if (res == 0) {
                preventExit = false;
                app.exit();
            }
        } else {
            preventExit = false;
            app.exit();
        }
    });


    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        require('electron').shell.openExternal(url);
    });

    if (process.env.APPIMAGE !== undefined && !fs.existsSync(path.join(shortcutDir, "WALC.desktop"))) {
        //Desktop Integration of AppImage
        integrate = dialog.showMessageBoxSync(win, {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Desktop Integration',
            message: "Do you want to integrate WALC to your Applications?"
        });

        if (integrate == 0) {
            integrateToDesktop(win);
        }
    }

}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});