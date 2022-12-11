const { app, ipcMain, Menu, BrowserWindow } = require('electron');
const walcinfo = require('../../package.json');
const lsbRelease = require('lsb-release');

const MainWindow = require('./MainWindow');
const DashboardWindow = require('./DashboardWindow');
const MainMenu = require('./MainMenu');
const DashboardMenu = require('./DashboardMenu');
const AppLock = require('./AppLock');
const settings = require('./settings');
const prompt = require('electron-prompt')

const openChat = number => {
	const link = document.createElement("a");
	link.setAttribute("href", `whatsapp://send?phone=${number}`);
	document.body.append(link);
	link.click();
	document.body.removeChild(link);
};

/**
 * @typedef Instance
 * @type {object}
 * @property {string} id
 * @property {string} name
 * @property {MainWindow} main
 * @property {DashboardWindow} dashboard
 * @property {AppLock} appLock
 */

module.exports = class InstanceManager {
	constructor() {
		/**
		 * @type {Object.<string, Instance>}
		 */
		this.instances = {};
		this._handlers = {};

		this._initIPC();

		lsbRelease((_, data) => {
			const installType = (process.env.APPIMAGE ? "AppImage" : (process.env.SNAP ? "Snap" : "Manual"));
			const version = walcinfo.version;
			const os = (data ? data.description : "Unknown (probably missing lsb_release)");
			this.aboutInfo = {
				installType,
				version,
				os,
			};
		});

		// TODO: store & read instance data to disk
	}

	_initIPC() {
		ipcMain.handle('getInstanceID', (event) => {
			return BrowserWindow.fromWebContents(event.sender)._id;
		});

		ipcMain.handle('instance.openDashboard', (event, id) => {
			this.openDashboard(id);
		});

		ipcMain.handle('instance.about', (event, id) => {
			return this.aboutInfo;
		});

		ipcMain.handle('instance.setDarkTheme', (event, id, darkTheme) => {
			settings.set('theme.dark.value', darkTheme);
		});

		['unlock', 'lock', 'setPassword', 'activity'].forEach((func) => {
			ipcMain.handle(`instance.appLock.${func}`, (event, id, ...args) => {
				if(!this.instances[id]) return;
				return this.instances[id].appLock[func](...args);
			});
		});

		[
			'initWhatsapp',
			'archiveAllChats',
			'markAllChatsAsRead',
			'integrateToDesktop',
			'chatNotification',
		].forEach((func) => {
			ipcMain.handle(`instance.main.${func}`, (event, id, ...args) => {
				this.instances[id].main[func](...args);
			});
		});

		ipcMain.handle('instance.dashboard-context-menu', (event, id) => {
			const menu = Menu.buildFromTemplate(DashboardMenu(id, this));
			menu.popup(BrowserWindow.fromWebContents(event.sender));
		});
	}

	newInstance(id, name) {
		const mainWindow = new MainWindow(id, name);
		const dashboardWindow = new DashboardWindow(id, name);
		const appLock = new AppLock(mainWindow);

		mainWindow.on('close-confirmed', () => this.handleClose(id));
		mainWindow.on('hide', () => this.emit('hide', id));
		mainWindow.on('ready', () => {
			this.setMainMenu(id);
			dashboardWindow.whatsappReady(true);

			appLock.init();
			appLock.on('lock', () => {
				this.setMainMenu(id, true);
				dashboardWindow.close();
				mainWindow.webContents.closeDevTools();
				dashboardWindow.webContents.closeDevTools();
			});
			appLock.on('unlock', () => this.setMainMenu(id));	
		});

		const instance = {
			id,
			name,
			main: mainWindow,
			dashboard: dashboardWindow,
			appLock,
		};

		this.instances[id] = instance;
		return instance;
	}

	/**
	 * Get instance by ID of the main window
	 * @param {string} mainId ID of main window
	 * @returns {Instance}
	 */
	getByMainId(mainId) {
		let instance = null;
		Object.keys(this.instances).some((id) => {
			if(this.instances[id].main.id === mainId) {
				instance = this.instances[id];
				return true;
			};
		});
		return instance;
	}

	close(id) {
		const instance = this.instances[id];
		instance.main.quitWindow();
	}

	openDashboard(id) {
		this.instances[id].dashboard.open();
	}

	async setMainMenu(id, disable = false) {
		const mainWindow = this.instances[id].main;
		if(disable) {
			mainWindow.setMenu(null);
			return;
		}
		const menubar = await MainMenu(id, mainWindow, this);
		mainWindow.setMenu(Menu.buildFromTemplate(menubar));
	}

	newChat() {
		prompt({
		    title: 'New Chat',
		    label: 'Enter a phone number:',
		    value: '',
		    inputAttrs: {
		        type: 'string'
		    },
		    type: 'input'
		})
		.then((number) => {
		    if(number === null) {
		        console.log('Cancelled');
		    } else {
		        console.log('Phone number: ', number);
		        
				// Open chat
				openChat(number);
		    }
		})
		.catch(console.error);
	}
	
	/**
	 * Attach an event listener
	 * @param {string} event Event name
	 * @param {function} handler Event handler
	 */
	on(event, handler) {
		if(!this._handlers[event]) {
			this._handlers[event] = [];
		}
		this._handlers[event].push(handler);
	}

	emit(event, id, args = {}) {
		let defaultPrevented = false;
		const eventObj = {
			preventDefault: () => defaultPrevented = true,
			instance: (id ? this.instances[id] : null),
			details: args,
		};

		if(Array.isArray(this._handlers[event])) {
			this._handlers[event].forEach((handler) => {
				handler(eventObj);
			});
		}

		return defaultPrevented;
	}

	handleClose(id) {
		const instance = this.instances[id];
		console.log('Instance list: ', Object.keys(this.instances));
		console.log('Quiting instance: ', id);
		if(instance) {
			instance.dashboard.quitWindow();
			instance.appLock.destroy();
			delete this.instances[id];
		}
		if(!Object.keys(this.instances).length && !this._quiting) {
			this._quiting = true;
			setTimeout(() => app.quit(), 500);
		}
	}
}
