const path = require('path');
const { Tray, Menu, ipcMain, nativeImage, nativeTheme } = require('electron');
const settings = require('./settings');

module.exports = class TrayManager {
	static get ICON_TYPES() {
		const monoLight = path.join(__dirname, '../icons/mono_logo_light512x512.png');
		const monoDark = path.join(__dirname, '../icons/mono_logo512x512.png');
		const monoAuto = (nativeTheme.shouldUseDarkColors ? monoLight : monoDark);

		return {
			COLORFUL: {
				key: 'COLORFUL',
				path: path.join(__dirname, '../icons/logo512x512.png'),
			},
			MONO_AUTO: {
				key: 'MONO_AUTO',
				path: monoAuto,
			},
			MONO_LIGHT: {
				key: 'MONO_LIGHT',
				path: monoLight,
			},
			MONO_DARK: {
				key: 'MONO_DARK',
				path: monoDark,
			},
		};
	}
	
	constructor() {
		this.tray = null;

		ipcMain.on('renderTray', (event, data) => {
			if(settings.get('trayIcon.enabled.value')) {
				const img = nativeImage.createFromDataURL(data);
				this.tray.setImage(img);
			}
		});

		ipcMain.handle('getTrayIcon', () => {
			return nativeImage.createFromPath(this.CURRENT_ICON_TYPE.path).toDataURL();
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
			this.tray = new Tray(this.CURRENT_ICON_TYPE.path);
			this.tray.setTitle('WALC');
			this.tray.setToolTip('WALC');
			this.setContextMenu();
			if(this.win.whatsappReady) {
				this.win.webContents.send('renderTray');
			}
		}
	}

	/** @returns {{ key: string, path: string }} */
	get CURRENT_ICON_TYPE() {
		let iconType = settings.get('trayIcon.iconType.value');
		if (!TrayManager.ICON_TYPES[iconType]) { // set default icon type if invalid type
			console.log(`invalid icon type "${iconType}", resetting to default icon`);
			const defaultType = settings.get('trayIcon.iconType.default');
			// settings.set('trayIcon.iconType.value', defaultType);
			iconType = defaultType;
		}
		return TrayManager.ICON_TYPES[iconType];
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
