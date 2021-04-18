const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
const createDesktopShortcut = require('create-desktop-shortcuts');
const { app, dialog, BrowserWindow, Notification } = require("electron");
const windowStateKeeper = require("electron-window-state");
const settings = require('./settings');
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const { Client } = require('whatsapp-web-electron.js');
// const getPortSync = require('get-port-sync');

const ICON_PATH = path.join(__dirname, '../icons/logo360x360.png');
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36';

// notifications template
const notifications = {
	lowBattery: {
		title: "Battery Low",
		body: "You battery is below 15%. Please Charge you phone to remain connected.",
	},
	offline: {
		title: 'WALC disconnected',
		body: 'Please check your connection.',
	},
	newStatus: (contact) => ({
		title: contact.name,
		body: "Posted a status update.",
	}),
	ready: {
		title: 'WALC connected',
		body: '',
	},
};

module.exports = class MainWindow extends BrowserWindow {
	constructor(id, name, options = {}) {
		// Load the previous state with fallback to defaults
		let windowState = windowStateKeeper({
			file: `window-state-main-${id}.json`,
			defaultWidth: 800,
			defaultHeight: 600,
		});

		const shouldHide = (
			settings.get('trayIcon.enabled.value') && settings.get('trayIcon.startHidden.value')
		);

		super({
			x: windowState.x,
			y: windowState.y,
			width: windowState.width,
			height: windowState.height,
			title: name,
			icon: ICON_PATH,
			webPreferences: {
				enableRemoteModule: false,
				preload: path.join(__dirname, '../preload.js'),
				spellcheck: settings.get('general.spellcheck.value'),
			},
			show: !shouldHide,
			// show: true,
			autoHideMenuBar: settings.get('trayIcon.autoHideMenuBar.value'),
			alwaysOnTop: settings.get('general.alwaysOnTop.value'),
			...options
		});

		windowState.manage(this);

		this.setMenu(null);

		this._id = id;
		this._name = name
		this._initEvents();
		this.loadURL('about:blank', { userAgent }).then(async () => {
			this._initWhatsapp();
		});
	}

	/**
	 * Send notification using a template
	 * @param {string} name Template name
	 * @param  {...any} args Arguments to pass to template
	 * @return {Notification|null}
	 */
	notify(name, ...args) {
		const enabled = settings.get('notification.enabled.value');
		const allowed = (
			!settings.get(`notification.${name}`) || // allow if there's no setting
			settings.get(`notification.${name}.value`) // if there is, then check if enabled
		);

		if(enabled && allowed) {
			let template = notifications[name];
			if(typeof template === 'function') {
				template = template(...args);
			}

			const notification = new Notification({
				silent: false,
				icon: ICON_PATH,
				...template,
			});
			notification.show();
			return notification;
		}
		return null;
	}

	/**
	 * Send a simple notification
	 * @param {string} title
	 * @param {string} body
	 * @param {object} params Additional params
	 * @return {Notification|null}
	 */
	simpleNotify(title, body, params = {}) {
		if(!settings.get('notification.enabled.value')) return null;

		const notification = new Notification({
			silent: false,
			icon: ICON_PATH,
			title, body,
			...params
		});
		notification.show();
		return notification;
	}

	/**
	 * Attempts to quit the window
	 * @param {boolean} force Bypass exit confirmation
	 */
	quitWindow(force = false) {
		this.isQuiting = true;
		this.exitConfirmed = force;
		this.close();
	}

	_initEvents() {
		this.isQuiting = false;
		this.exitConfirmed = false;

		this.on('close', (e) => {
			if(this.isQuiting && this.exitConfirmed) {
				this.emit('close-confirmed');
				return
			}

			e.preventDefault();

			if (
				settings.get('trayIcon.enabled.value') &&
				settings.get('trayIcon.closeToTray.value')
				&& !this.isQuiting
			) {
				// close to tray
				this.hide();
			} else if (settings.get('general.askOnExit.value') && !this.exitConfirmed) {
				// confirm exit
				const res = dialog.showMessageBoxSync(this, {
					type: 'none',
					buttons: ['Yes', 'No'],
					title: 'Exit?',
					message: "Are you sure you want to exit WALC?"
				});
				if (res == 0) {
					this.quitWindow(true);
				} else {
					this.isQuiting = false;
				}
			} else {
				this.quitWindow(true);
			}
		});

		let preventTitleChange = true;
		this.on('page-title-updated', (evt) => {
			if (preventTitleChange) {
				evt.preventDefault();
				preventTitleChange = false;
				this.setTitle(this._name);
				preventTitleChange = true;
			}
		});

		this.webContents.on('new-window', (event, url) => {
			event.preventDefault();
			require('electron').shell.openExternal(url);
		});

		this.webContents.on('did-fail-load', () => {
			this.webContents.send('renderTray');
			this.loadFile('src/offline.html');
			this.notify('offline');
			// new Notification({ "title": "WALC disconnected", "body": "Please check your connection.", "silent": false, "icon": ICON_PATH }).show();
			isConnected = false;
		});

		settings.onDidChange('general.alwaysOnTop', (value) => {
			this.setAlwaysOnTop(value);
		});
	}

	async _initWhatsapp() {
		console.log('Initializing');
		// const freePort = getPortSync();
		// await pie.initialize(app, freePort);
		// console.log('Initialized');
		const pieBrowser = await pie.connect(app, puppeteer);

		console.log('Creating client');
		this.whatsapp = new Client(pieBrowser);

		this.whatsapp.on('ready', () => {
			console.log('whatsapp-web.js ready')
			this.webContents.send('ready', this._id);
			this.emit('ready');
			this.notify('ready');
		});

		this.whatsapp.on("change_battery", (batteryInfo) => {
			if (batteryInfo.battery <= 15 && batteryInfo.battery % 5 == 0 && batteryInfo.plugged == false) {
				this.notify('lowBattery');
				// new Notification({ "title": "Battery Low", "body": "You battery is below 15%. Please Charge you phone to remain connected.", "silent": false, "icon": "icons/logo360x360.png" }).show()
			}
		});

		this.whatsapp.on("message", async (msg) => {
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
					this.notify('newStatus', contact);
					// new Notification({ "title": contact.name, "body": "Posted a status update.", "icon": contactImage }).show();
				}
			}
		});

		this.whatsapp.initialize();
	}

	async archiveAllChats() {
		const currentNotify = this.simpleNotify('Archive All Chats', 'Archiving all chats...', { silent: true });
		const chats = await this.whatsapp.getChats();
		chats.forEach(async (chat) => {
			await chat.archive();
		});
		currentNotify.close();
		this.simpleNotify('Archive All Chats', 'All chats have been archived.');
	}

	async markAllChatsAsRead() {
		this.simpleNotify('Mark All Chats', 'Marking all chats...');
		const chats = await this.whatsapp.getChats()
		chats.forEach(async (chat) => {
			await chat.sendSeen();
		});
	}

	integrateToDesktop() {
		const shortcutDir = path.join(homedir, ".local/share/applications");
		const iconDir = path.join(homedir, ".local/share/WALC");
		const iconPath = path.join(iconDir, "logo360x360.png");
		fs.mkdirSync(shortcutDir, { recursive: true });
		fs.mkdirSync(iconDir, { recursive: true });
		fs.copyFileSync(path.join(__dirname, "../icons/logo360x360.png"), iconPath);
		const shortcutCreated = createDesktopShortcut({
			onlyCurrentOS: true,
			customLogger: (msg, error) => {
				dialog.showMessageBoxSync(this, {
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
			dialog.showMessageBoxSync(this, {
				type: 'none',
				buttons: ['OK'],
				title: 'Desktop Integration',
				message: "WALC has successfully been integrated to your Applications."
			});
		}
	}
}
