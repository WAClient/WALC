const MainWindow = require('./MainWindow');
const DashboardWindow = require('./DashboardWindow');
const { app, Menu, ipcMain } = require('electron');
const MainMenu = require('./MainMenu');

/**
 * @typedef Instance
 * @type {object}
 * @property {string} id
 * @property {string} name
 * @property {MainWindow} main
 * @property {DashboardWindow} dashboard
 */

module.exports = class InstanceManager {
	constructor() {
		/**
		 * @type {Object.<string, Instance>}
		 */
		this.instances = {};
		this._handlers = {};

		this._initIPC();

		// TODO: store & read instance data to disk
	}

	_initIPC() {
		ipcMain.handle('instance.openDashboard', (event, id, darkTheme) => {
			this.openDashboard(id, darkTheme);
		});
	}

	newInstance(id, name) {
		const mainWindow = new MainWindow(id, name);
		const dashboardWindow = new DashboardWindow(id, name);
		mainWindow.on('close-confirmed', () => this.handleClose(id));
		mainWindow.on('hide', () => this.emit('hide', id));
		mainWindow.on('ready', async () => {
			const menubar = await MainMenu(id, mainWindow, this);
			mainWindow.setMenu(
				Menu.buildFromTemplate(menubar)
			);
		})

		const instance = {
			id,
			name,
			main: mainWindow,
			dashboard: dashboardWindow,
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

	openDashboard(id, darkTheme = null) {
		this.instances[id].dashboard.open(darkTheme);
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
		console.log(id, instances);
		const instance = this.instances[id];
		instance.dashboard.quitWindow();
		delete this.instances[id];

		if(!Object.keys(this.instances).length) {
			app.quit();
		}
	}
}