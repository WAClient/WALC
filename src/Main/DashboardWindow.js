const path = require('path');
const { BrowserWindow, Menu } = require("electron");
const windowStateKeeper = require("electron-window-state");

module.exports = class DashboardWindow extends BrowserWindow {
	constructor(id, name, options = {}) {
		// Load the previous state with fallback to defaults
		let windowState = windowStateKeeper({
			file: `window-state-dashboard-${id}.json`,
			defaultWidth: 800,
			defaultHeight: 600,
		});

		super({
			x: windowState.x,
			y: windowState.y,
			width: windowState.width,
			height: windowState.height,
            title: `${name} Dashboard`,
            icon: path.join(__dirname, 'icons/logo360x360.png'),
            show: false,
            webPreferences: {
                nodeIntegration: true,
            },
			...options
		});

		windowState.manage(this);

		this.setMenu(
			Menu.buildFromTemplate([{ role: 'viewMenu' }])
		);

		// just for debugging
		// this.show();

		// added timeout to prevent whatsapp being loaded to this window instead of main
		// hopefully no race condition bug later...
		setTimeout(() => {
			this.loadFile('public/index.html').then(() => {
				this.webContents.send('setID', id);
				// this.webContents.openDevTools();
			});
		}, 2000);

		this.isQuiting = false;
		
		this.on('close', (e) => {
			if(this.isQuiting) {
				return;
			}
            e.preventDefault();
            this.hide();
        });

		this.webContents.on('new-window', (event, url) => {
			event.preventDefault();
			require('electron').shell.openExternal(url);
		});
	}

	open(darkTheme = null) {
		if(darkTheme !== null) {
			this.darkTheme(darkTheme);
		}
		this.navigateTo('/');
		this.show();
	}

	navigateTo(url) {
		this.webContents.send('navigate', url);
	}

	darkTheme(status) {
		this.webContents.send('darkTheme', status);
	}

	quitWindow() {
		this.isQuiting = true;
		this.close();
	}
}