const path = require('path');
const { app, Tray, Menu, ipcMain, nativeImage } = require('electron');
const settings = require('./settings');

module.exports = class TrayManager {
	constructor() {
		this.tray = null;

		ipcMain.on('renderTray', (event, data) => {
			if(settings.get('trayIcon.enabled.value')) {
				const img = nativeImage.createFromDataURL(data);
				this.tray.setImage(img);
			}
		});

		settings.onDidChange('trayIcon.enabled', (value) => {
			if(value && !this.tray) {
				this.init();
			} else if(!value && this.tray) {
				this.setVisibility(true, false);
				this.destroy();
			}
		});

		settings.onDidChange('trayIcon.countMuted', () => {
			this.win.webContents.send('renderTray');
		});
	}

	/**
	 * Create tray
	 * TODO: figure out multi instance
	 * @param {import('./MainWindow')} mainWindow Main BrowserWindow
	 */
	init(mainWindow) {
		if(mainWindow) {
			this.win = mainWindow;
		}
		if(settings.get('trayIcon.enabled.value')) {
			this.tray = new Tray(path.join(__dirname, '../icons/logo360x360.png'));
			this.tray.setTitle('WALC');
			this.tray.setToolTip('WALC');
			this.setContextMenu();
			if(this.win.whatsappReady) {
				this.win.webContents.send('renderTray');
			}
		}
	}

	setContextMenu(state = null) {
		if(state === null) state = this.win.isVisible();
		const visibilityLabel = (state ? 'Hide' : 'Show') + ' WALC';
		const menu = Menu.buildFromTemplate([{
			label: visibilityLabel,
			click: () => this.toggleVisibility()
		}, {
			label: 'Quit',
			click: () => {
				this.win.quitWindow();
			}
		}]);
		this.tray.setContextMenu(menu);
	}

	setVisibility(state, focus = true) {
		if(state && focus) {
			this.win.show();
		} else if(state) {
			this.win.showInactive();
		} else {
			this.win.hide();
		}
		this.setContextMenu(state);
	}

	toggleVisibility() {
		this.setVisibility(!this.win.isVisible());
	}

	destroy() {
		if(this.tray) {
			this.tray.destroy();
			this.tray = null;
		}
	}
}
