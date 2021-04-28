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
// const Store = require('electron-store');
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
const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
const TrayManager = require('./Main/TrayManager');

const ICON_PATH = path.join(__dirname, 'icons/logo360x360.png');
// Information to be displayed in About Dialog
var aboutWALC;

let isConnected = true;
let preventExit = true;

let pieBrowser;
let botClient;

let customeTitle = "WALC";

let preventTitleChange = true;

lsbRelease(function (_, data) {
    aboutWALC = `Installation Type: ${process.env.APPIMAGE ? "AppImage" : ((isSNAP) ? "Snap" : "Manual")}
${isSNAP ? `Snap Version:${process.env.SNAP_VERSION}(${process.env.SNAP_REVISION})` : ""}OS: ${data ? data.description : "Unknown (probably missing lsb_release)"}
`;
});

contextMenu({
    showInspectElement: false,
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


//Default Settings
// var settings = new Store({
//     name: 'settings',
//     defaults: {
//         askOnExit: {
//             value: true,
//             name: 'Ask on Exit',
//             description: 'If enabled, WALC will confirm everytime you want to close it. Default is true.'
//         },
//         multiInstance: {
//             value: false,
//             name: 'Allow Multiple Instances',
//             description: "It allows you open multiple instances of WALC so you can login to more than one WhatsApp account. It is disabled by default."
//         },
//         alwaysOnTop: {
//             value: false,
//             name: 'Always On Top',
//             description: 'Allow WALC to always be shown in front of other apps'
//         },
//         closeToTray: {
//             value: false,
//             name: 'Close to Tray',
//             description: 'If enabled, WALC will be hidden everytime you want to close it. Default is false.'
//         },
//         startHidden: {
//             value: false,
//             name: 'Start Hidden',
//             description: 'Hide WALC on startup'
//         },
//         darkMode: {
//             value: false,
//             name: 'Dark Mode',
//             description: 'Enable Dark Mode in WhatsApp Web'
//         },
//         autoHideMenuBar: {
//             value: false,
//             name: "Auto-Hide Menu Bar",
//             description: "Auto-hide top menu bar"
//         },
//         countMuted: {
//             value: true,
//             name: 'Include Muted Chats',
//             description: 'Count muted chats in the badge counter'
//         },
//         newStatusNotification: {
//             value: false,
//             name: 'New Status Updates',
//             description: 'Display Notification when someone updates their status.'
//         }
//     }
// });

const notificationsMenu = [{
    label: 'New Status Updates',
    sublabel: 'Display Notification ofr Unmuted Status Updates',
    type: 'checkbox',
    checked: settings.get("newStatusNotification.value"),
    click: (menuItem) => {
        settings.set('newStatusNotification.value', menuItem.checked);
    }
}];

const WhatsAppMenu = [{
    label: "Archive All Chats",
    sublabel: "Archive all private and group chats",
    click: async (menuItem) => {
        menuItem.enabled = false;
        await archiveAllChats();
        menuItem.enabled = true;
    }
}, {
    label: "Mark All As Read",
    sublabel: "Mark all chat as read",
    click: async (menuItem, window, e) => {
        menuItem.enabled = false;
        await markAllChatsAsRead();
        menuItem.enabled = true;
    }
}, {
    label: "Notification",
    sublabel: "Customize WALC Notifications",
    type: 'submenu',
    submenu: notificationsMenu
}];

const settingsMenu = [{
    label: settings.get('askOnExit.name'),
    sublabel: 'Ask before exiting this window',
    type: 'checkbox',
    checked: settings.get('askOnExit.value'),
    click: (menuItem, window, e) => {
        settings.set('askOnExit.value', menuItem.checked);
        preventExit = true;
    },
}, {
    label: settings.get('multiInstance.name'),
    sublabel: 'Allow using multiple WhatsApp accounts',
    type: 'checkbox',
    checked: settings.get('multiInstance.value'),
    click: (menuItem, window, e) => {
        settings.set('multiInstance.value', menuItem.checked);
        preventExit = true;
    },
}, {
    label: settings.get('closeToTray.name'),
    sublabel: 'Keep WALC open in Background',
    type: 'checkbox',
    checked: settings.get('closeToTray.value'),
    click: (menuItem) => {
        settings.set('closeToTray.value', menuItem.checked);
    }
}, {
    label: settings.get('startHidden.name'),
    sublabel: 'Keep WALC closed to Tray on Start',
    type: 'checkbox',
    checked: settings.get('startHidden.value'),
    click: (menuItem) => {
        settings.set('startHidden.value', menuItem.checked);
    }
}, {
    label: settings.get('countMuted.name'),
    sublabel: settings.get('countMuted.description'),
    type: 'checkbox',
    checked: settings.get('countMuted.value'),
    click: (menuItem) => {
        settings.set('countMuted.value', menuItem.checked);
        win.webContents.send('renderTray');
    }
}, {
    label: "Update Desktop Integration",
    sublabel: 'Update WALC Desktop Shortcut',
    type: 'normal',
    checked: settings.get('multiInstance.value'),
    click: (menuItem, window, e) => {
        integrateToDesktop(window);
    },
    visible: process.env.APPIMAGE !== undefined
}, {
    label: "Auto-Hide Menu Bar",
    sublabel: "Toggle menu bar visibility using Alt",
    type: 'checkbox',
    checked: settings.get("autoHideMenuBar.value"),
    click: (menuItem) => {
        settings.set('autoHideMenuBar.value', menuItem.checked);
        if (menuItem.checked) {
            win.setMenuBarVisibility(false);
        } else {
            win.setMenuBarVisibility(true);
        }
        win.autoHideMenuBar = menuItem.checked;
    }
}];

const windowMenu = [{
    label: 'Debug Tools',
    sublabel: 'Toggle Chrome Developer Tools',
    role: 'toggleDevTools'
}, {
    label: 'Reload Without Cache',
    sublabel: 'Reload after discarding cached data',
    role: 'forceReload'
}, {
    label: 'separator',
    type: 'separator'
}, {
    label: 'Always On Top',
    type: 'checkbox',
    sublabel: 'Keep this window on top of all other windows',
    checked: settings.get('alwaysOnTop.value'),
    click: (menuItem) => {
        settings.set('alwaysOnTop.value', menuItem.checked);
        win.setAlwaysOnTop(menuItem.checked);
    }

}, {
    label: 'Zoom',
    sublabel: 'Set Zoom of this Window',
    type: 'submenu',
    submenu: [{
        label: 'Zoom In',
        sublabel: 'Increase Zoom',
        role: 'zoomIn',
    }, {
        label: 'Zoom Out',
        sublabel: 'Decrease Zoom',
        role: 'zoomOut',
    }, {
        label: 'Reset Zoom',
        sublabel: 'Reset Zoom to 100%',
        role: 'resetZoom',
    }]
}, {
    label: 'separator',
    type: 'separator'
}, {
    label: 'Exit',
    sublabel: 'Quit current window of WALC completely',
    type: 'normal',
    accelerator: 'CmdOrCtrl+Q',
    click: () => {
        app.isQuiting = true;
        app.quit();
    },
}];

const helpMenu = [{
    label: 'Find Help',
    sublabel: 'Get Help on WALC Troubleshooting Board',
    click: () => {
        shell.openExternal("https://github.com/cstayyab/WALC/discussions/categories/troubleshooting");
    },
    accelerator: 'F1'
}, {
    label: 'Report Problem',
    sublabel: 'Create an Bug Report on GitHub',
    click: () => {
        shell.openExternal(walcinfo.bugs.url + "/new/?template=bug_report.md&labels=bug&title=[Bug+Report]");
    }
}, {
    label: 'separator',
    type: 'separator'
}, {
    label: 'Request a Feature',
    sublabel: 'Create a new feature request on GitHub',
    click: () => {
        shell.openExternal("https://github.com/cstayyab/WALC/discussions/categories/feature-requests");
    }
}, {
    label: 'Vote for a Feature',
    sublabel: 'Vote for existing features on FeatHub',
    visible: false,
    click: () => {
        shell.openExternal("https://feathub.com/cstayyab/WALC");
    }
}, {
    label: 'separator',
    type: 'separator'
}, {
    label: 'Rate && Review WALC',
    sublabel: 'Help WALC grow by reviewing',
    click: () => {
        rateAndReviewWALC();
    }
}, {
    label: 'About WALC',
    sublabel: 'See Version and Diagnostic Info.',
    click: () => {

        dialog.showMessageBox(win, {
            type: "none",
            buttons: ["Copy to Clipboard", "Close"],
            defaultId: "0",
            title: "About WALC",
            cancelId: "0",
            message: `WALC ${walcinfo.version}`,
            detail: aboutWALC,
        }).then(({ response }) => {
            if (response == 0) {
                clipboard.writeText(`WALC ${walcinfo.version}` + "\n" + aboutWALC)
                new Notification({ "title": "About WALC", "body": "Information Copied to Clipboard.", "silent": true, "icon": "icons/logo360x360.png" }).show()
            }
        });
    }
}]

const mainmenu = [{
    label: '&WhatsApp',
    submenu: WhatsAppMenu
}, {
    label: '&Settings',
    submenu: settingsMenu,
}, {
    label: 'Wi&ndow',
    submenu: windowMenu,
}, {
    label: '&Help',
    submenu: helpMenu
}];

ipcMain.on('loadWA', loadWA);

ipcMain.on('focusWindow', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if(!window.isVisible()) window.show();
    window.focus();
});

ipcMain.on('openDashboard', (event) => {
    loadDashboard();
});

ipcMain.handle('getSettings', (event, key = null) => {
    if(key) {
        return settings.get(key);
    }
    return settings.store;
});

ipcMain.handle('setSettings', (event, values) => {
    for (const [key, value] of Object.entries(values)) {
        settings.set(key, value);
    }
});

ipcMain.handle('getIcon', () => {
    return nativeImage.createFromPath(ICON_PATH).toDataURL();
});

ipcMain.handle('quit', () => {
    app.isQuiting = true;
    app.quit();
});

//Close second instance if multiInstance is disabled
if (!settings.get('advanced.multiInstance.value') && !app.requestSingleInstanceLock()) {
    win = null;
    app.isQuiting = true;
    preventExit = false;
    app.quit();
    process.exit(0);
} else {
    app.on('second-instance', (event, cmdLine, workingDir) => {
        if (!settings.get('advanced.multiInstance.value') && win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
}

function loadDashboard() {
    dashboardWin.loadFile('public/index.html');
    dashboardWin.show();
}

function loadWA() {
    win.loadURL('about:blank', { 'userAgent': userAgent }).then(async () => {
        dashboardWin = new BrowserWindow({
            title: 'WALC',
            icon: path.join(__dirname, 'icons/logo360x360.png'),
            show: false,
            webPreferences: {
                nodeIntegration: true,
            },
        });

        dashboardWin.on('close', (e) => {
            e.preventDefault();
            dashboardWin.hide();
        });

        // loadDashboard();
        // return;

        pie.connect(app, puppeteer).then(async (pieBrowser) => {
            botClient = new Client(pieBrowser);

            botClient.on('ready', () => {
                const menubar = Menu.buildFromTemplate(mainmenu);
                Menu.setApplicationMenu(menubar);
                // win.setMenuBarVisibility(!settings.get('autoHideMenuBar.value'));
                win.webContents.send('storeOnLoad');

                customeTitle = `WALC`;
                preventTitleChange = false;
                win.setTitle(customeTitle);
                preventTitleChange = true;
            });

            botClient.on("change_battery", (batteryInfo) => {
                if (batteryInfo.battery <= 15 && batteryInfo.battery % 5 == 0 && batteryInfo.plugged == false) {
                    new Notification({ "title": "Battery Low", "body": "You battery is below 15%. Please Charge you phone to remain connected.", "silent": false, "icon": "icons/logo360x360.png" }).show()
                }
            });

            botClient.on("message", async (msg) => {
                if (settings.get("notification.newStatus.value")) {
                    const contact = await msg.getContact();
                    if (msg.isStatus && !contact.statusMute) {
                        let contactImage;
                        picURL = await contact.getProfilePicUrl();
                        if (picURL) {
                            let image = await axios.get(picURL, { responseType: 'arraybuffer' });
                            let returnedB64 = Buffer.from(image.data).toString('base64');
                            let imgDataUri = "data:" + image.headers['content-type'] + ";base64," + returnedB64;
                            contactImage = nativeImage.createFromDataURL(imgDataUri);
                        }
                        new Notification({ "title": contact.name, "body": "Posted a status update.", "icon": contactImage }).show();
                    }
                }
            });

            botClient.initialize();

        }).catch((err) => {
            console.log(err);
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
    win.webContents.on('did-fail-load', () => {
        win.webContents.send('renderTray');
        win.loadFile('src/offline.html');
        new Notification({ "title": "WALC disconnected", "body": "Please check your connection.", "silent": false, "icon": ICON_PATH }).show();
        isConnected = false;
    });
}

function createWindow() {
    // Yet another attempt to handle WhatsApp Web ServiceWorker.js error (Issue #21)
    // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    //     details.requestHeaders['User-Agent'] = userAgent;
    //     callback({ cancel: false, requestHeaders: details.requestHeaders });
    // });

    // Load the previous state with fallback to defaults
    let windowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });

    const shouldHide = (
        settings.get('trayIcon.enabled.value') && settings.get('trayIcon.startHidden.value')
    );

    // Create the browser window.
    win = new BrowserWindow({
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        title: 'WALC',
        icon: path.join(__dirname, 'icons/logo360x360.png'),
        webPreferences: {
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: settings.get('trayIcon.autoHideMenuBar.value'),
        show: !shouldHide,
    });
    win.setAlwaysOnTop(settings.get('general.alwaysOnTop.value'));
    //Hide Default menubar
    win.setMenu(null);

    const trayManager = new TrayManager(win);
    trayManager.init();

    // load the Main Page of the app.
    loadWA();
    win.setTitle('WALC');

    // register window state listeners
    windowState.manage(win);

    win.on('close', e => {
        e.preventDefault();
        if (
            settings.get('trayIcon.enabled.value') &&
            settings.get('trayIcon.closeToTray.value')
            && !app.isQuiting
        ) {
            trayManager.toggleVisibility();
        } else if (settings.get('general.askOnExit.value') && preventExit) {
            res = dialog.showMessageBoxSync(win, {
                type: 'none',
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




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    if (process.env.NODE_ENV !== 'production') {
        // FIXME: properly load Vue.js devtools
        // installExtension(VUEJS_DEVTOOLS, { loadExtensionOptions: {allowFileAccess: true} })
        //     .then((name) => console.log(`Added Extension:  ${name}`))
        //     .catch((err) => console.log('An error occurred: ', err));
        const vueDevToolsPath = path.join(
            os.homedir(),
            `.config/google-chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.4_0`
        );
        session.defaultSession.loadExtension(vueDevToolsPath, { allowFileAccess: true })
            .then(() => console.log('Vue extension loaded'));
    }
    createWindow();
});

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
