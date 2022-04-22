#!/usr/bin/env electron
const {
    app,
    BrowserWindow,
    session,
    Menu,
    dialog,
    Tray,
    ipcMain,
    nativeImage,
    Notification,
    shell,
    clipboard,
} = require('electron');
const { autoUpdater } = require("electron-updater");
const { Client } = require('whatsapp-web-electron.js');
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
autoUpdater.checkForUpdatesAndNotify();
var path = require('path');
const settings = require('./Main/settings');
const windowStateKeeper = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const fs = require('fs');
const os = require('os')
const getPortSync = require('get-port-sync');
const createDesktopShortcut = require('create-desktop-shortcuts');
const homedir = require('os').homedir();
const walcinfo = require('../package.json');
const lsbRelease = require('lsb-release');
const axios = require('axios');
const TrayManager = require('./Main/TrayManager');
const InstanceManager = require('./Main/InstanceManager');

const ICON_PATH = path.join(__dirname, 'icons/logo360x360.png');
const DASHBOARD_ICON_PATH = path.join(__dirname, 'icons/dashboard.png');

// Information to be displayed in About Dialog
var aboutWALC;

let isConnected = true;
let preventExit = true;

let pieBrowser;
let botClient;

let customeTitle = "WALC";

let preventTitleChange = true;

const instanceManager = new InstanceManager();
const trayManager = new TrayManager();

lsbRelease(function (_, data) {
    aboutWALC = `Installation Type: ${process.env.APPIMAGE ? "AppImage" : ((isSNAP) ? "Snap" : "Manual")}
${isSNAP ? `Snap Version:${process.env.SNAP_VERSION}(${process.env.SNAP_REVISION})` : ""}OS: ${data ? data.description : "Unknown (probably missing lsb_release)"}
`;
});

contextMenu({
    showInspectElement: false,
    shouldShowMenu: (event, params) => {
        return !(params.titleText === 'Open Dashboard' && params.mediaType === 'image');
    }
});

// set user agent manually
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36';
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/** @type {BrowserWindow} */
let win;
/** @type {BrowserWindow} */
let dashboardWin;
findID = null;
emptyBody = null;

let freePort = null;
try {
    freePort = getPortSync();
    pie.initialize(app, freePort);
}
catch (e) { console.log(e); }

//SNAP Information
const isSNAP = process.env.SNAP !== undefined && process.env.SNAP !== null;

const shortcutDir = path.join(homedir, ".local/share/applications");
//Create Desktop Shortcut for AppImage
function integrateToDesktop(win) {
    const iconDir = path.join(homedir, ".local/share/WALC");
    const iconPath = path.join(iconDir, "logo360x360.png");
    fs.mkdirSync(shortcutDir, { recursive: true });
    fs.mkdirSync(iconDir, { recursive: true });
    fs.copyFileSync(path.join(__dirname, "icons/logo360x360.png"), iconPath);
    const shortcutCreated = createDesktopShortcut({
        onlyCurrentOS: true,
        customLogger: (msg, error) => {
            dialog.showMessageBoxSync(win, {
                type: 'none',
                buttons: ['OK'],
                title: 'Desktop Integration',
                message: msg,
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
    if (shortcutCreated) {
        dialog.showMessageBoxSync(win, {
            type: 'none',
            buttons: ['OK'],
            title: 'Desktop Integration',
            message: "WALC has successfully been integrated to your Applications."
        });
    }
}

ipcMain.on('focusWindow', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if(!window.isVisible()) window.show();
    window.focus();
});

ipcMain.on('getSettings', (event, key = null) => {
    if(key) {
        event.returnValue = settings.getMasked(key);
        return;
    }
    event.returnValue = settings.storeMasked;
});

ipcMain.on('setSettings', (event, values) => {
    for (const [key, value] of Object.entries(values)) {
        settings.setMasked(key, value);
    }
    event.returnValue = true;
});

ipcMain.handle('getIcon', () => {
    return nativeImage.createFromPath(ICON_PATH).toDataURL();
});

ipcMain.handle('getDashboardIcon', () => {
    return nativeImage.createFromPath(DASHBOARD_ICON_PATH).toDataURL();
});

ipcMain.handle('getStyle', () => {
    return new Promise((resolve) => {
        const stylePath = path.join(__dirname, 'Renderer/renderer.css');
        fs.readFile(stylePath, 'utf-8', (err, data) => {
            resolve(data);
        });
    });
});

ipcMain.handle('quit', (event, id) => {
    instanceManager.close(id);
});

function createWindow() {
	const instance = instanceManager.newInstance('walc', 'WALC');
	win = instance.main;
    setTimeout(() => {
        trayManager.init(win);
        instanceManager.on('hide', () => {
            trayManager.setContextMenu(false);
        });
    }, 3000);

    if (process.env.APPIMAGE !== undefined && !fs.existsSync(path.join(shortcutDir, "WALC.desktop"))) {
        //Desktop Integration of AppImage
        integrate = dialog.showMessageBoxSync(win, {
            type: 'none',
            buttons: ['Yes', 'No'],
            title: 'Desktop Integration',
            message: "Do you want to integrate WALC to your Applications?"
        });
        
        if (integrate == 0) {
            integrateToDesktop(win);
        }
    }

}

const gotTheLock = app.requestSingleInstanceLock();

if(!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        trayManager.setVisibility(true);
    });
    
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
        if(!app.isPackaged) {
            const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
            installExtension(VUEJS_DEVTOOLS, { loadExtensionOptions: {allowFileAccess: true} })
                .then((name) => console.log(`Added Extension:  ${name}`))
                .catch((err) => console.log('An error occurred: ', err));
        }
        createWindow();
    });
}

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

/* Additional Functions */
function openInSnapStore() {
    shell.openExternal("snap://walc");
}

function viewOnLinuxApps() {
    shell.openExternal("https://www.linux-apps.com/p/1383431/");
}

function rateAndReviewWALC() {
    if (isSNAP) {
        openInSnapStore();
    } else {
        viewOnLinuxApps();
    }
}

/* All functions related to WhatsBot */
async function archiveAllChats() {
    currentNotify = new Notification({ "title": "Archive All Chats", "body": "Archiving all chats . . .", "silent": true, "icon": "icons/logo360x360.png" })
    currentNotify.show();
    chats = await botClient.getChats()
    chats.forEach(async (chat) => {
        await chat.archive();
    })
    currentNotify.close();
    new Notification({ "title": "Archive All Chats", "body": "All chats have been archived.", "silent": true, "icon": "icons/logo360x360.png" })

}

async function markAllChatsAsRead() {
    chats = await botClient.getChats()
    chats.forEach(async (chat) => {
        await chat.sendSeen();
    });
}
