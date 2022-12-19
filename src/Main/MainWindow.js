const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
const createDesktopShortcut = require('create-desktop-shortcuts');
const { app, dialog, BrowserWindow, Notification, nativeImage } = require("electron");
const windowStateKeeper = require("electron-window-state");
const settings = require('./settings');
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const { Client } = require('whatsapp-web-electron.js');
const { Notify, Config: NotifyConfig } = require('./Notify');
const getPixels = require("get-pixels");
// const getPortSync = require('get-port-sync');

const ICON_PATH = path.join(__dirname, '../icons/logo256x256.png');
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Chrome/107.0.5304.141 Safari/605.1.15';

NotifyConfig.closeReplacedNotify = true;

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
				preload: path.join(__dirname, '../Renderer/App.js'),
				spellcheck: settings.get('general.spellcheck.value'),
				contextIsolation: false,
			},
			show: !shouldHide,
			// show: true,
			autoHideMenuBar: true,
			alwaysOnTop: settings.get('general.alwaysOnTop.value'),
			...options
		});

		windowState.manage(this);

		// this.setMenu(null);
		// this.webContents.openDevTools();

		this._id = id;
		this._name = name
		this.recentNotification = {};
		this.initEvents();
		this.initWhatsapp();
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

	initEvents() {
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

		this.webContents.setWindowOpenHandler((details) => {
			require('electron').shell.openExternal(details.url);
			return { action: 'deny' };
		});

		this.webContents.on('did-fail-load', () => {
			const darkTheme = settings.get('theme.dark.value');
			this.loadFile('public/offline.html', { hash: (darkTheme ? 'dark' : '') });
			this.webContents.send('renderTray');
			this.notify('offline');
		});

		settings.onDidChange('general.alwaysOnTop', (value) => {
			this.setAlwaysOnTop(value);
		});

		settings.onDidChange('general.fullWidth', (value) => {
			this.webContents.send('setFullWidth', value);
		});
	}

	async getImageData(dataUrl) {
		if(!dataUrl) return;
		
		const iconImage = nativeImage.createFromDataURL(dataUrl);
		const { width, height } = iconImage.getSize();
		
		return new Promise((resolve) => {
			getPixels(iconImage.toPNG(), 'image/png', (err, pixels) => {
				const imageData = [];
				if(err) {
					console.log("Bad image path", err)
					resolve(null);
					return;
				}
				for (let y = 0; y < pixels.shape[1]; y++) {
					for (let x = 0; x < pixels.shape[0]; x++) {
						[0, 1, 2, 3].forEach((i) => {
							imageData.push(pixels.get(x, y, i));
						});
					}
				}

				resolve({
					width,
					height,
					hasAlpha: true,
					data: imageData,
				});
			});
		});
	}

	formatNotification(body) {
		if(!body) return;

		// store link before formatting it later
		// to prevent & from getting replaced
		const links = [];
		body = body.replace(/(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]{2,}\.[\w/\-&?=%.]{2,}/g, (match) => {
			const str = `%{{links.${links.length}}}%`;
			links.push(match);
			return str;
		});

		// escape html
		const escapeMap = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
		};
		body = body.replace(/[&<>]/g, (m) => escapeMap[m]);

		// replace *bold* with <b>bold</b>
		body = body.replace(/(?:^|\W)\*(.+?)\*(?=\W|$)/g, (match, group) => {
			const extraSpace = (match.startsWith(' ') ? ' ' : '');
			return extraSpace + `<b>${group}</b>`;
		});

		// replace _italic_ with <i>italic</i>
		body = body.replace(/(?:^|\W)_(.+?)_(?=\W|$)/g, (match, group) => {
			const extraSpace = (match.startsWith(' ') ? ' ' : '');
			return extraSpace + `<i>${group}</i>`;
		});

		// put link back
		body = body.replace(/%{{links\.(\d)}}%/g, (match, group) => {
			const link = links[group];
			return `<a href="${link}">${link.replace('&', '&amp;')}</a>`;
		})

		return body;
	}

	groupNotification({ body, tag }) {
		if(!tag) {
			return { id: 0, body };
		}

		if(this.recentNotification[tag]) {
			this.recentNotification[tag].messages.push(body);
		} else {
			this.recentNotification[tag] = {
				id: Math.floor(Math.random() * 999999) + 1,
				messages: [body],
			}
		}

		return {
			id: this.recentNotification[tag].id,
			body: this.recentNotification[tag].messages.join("\n"),
		};
	}

	async chatNotification(options) {
		const { title, icon, tag } = options;
		const { id, body } = this.groupNotification(options)
		const desktopEntry = path.join(homedir, '.local/share/applications/WALC.desktop');
		const imageData = await this.getImageData(icon);

		const notif = new Notify({
			summary: title,
			replacesId: id,
			body: this.formatNotification(body),
			timeout: 5000,
			appName: 'WALC',
			hints: {
				desktopEntry,
				imageData,
			},
		});

		notif.setDefaultAction(() => {
			// console.log('notification clicked');
			if(tag) {
				this.whatsapp.interface.openChatWindow(tag);
			}
			if(!this.isVisible()) this.show();
			this.focus();
		});

		if(tag) {
			notif.on('close', ({ reason }) => {
				if (reason === 101) return; // replaced notification
				delete this.recentNotification[tag];
			});
	
			notif.addAction('Mark as read', async() => {
				// console.log('marked as read');
				(await this.whatsapp.getChatById(tag)).sendSeen();
			});

			const capabilities = await Notify.supportedCapabilities();
			const canReply = capabilities.includes('inline-reply');
			if(canReply) {
				notif.addAction('Reply', 'inline-reply', async (reply) => {
					// console.log('replied', reply);
					(await this.whatsapp.getChatById(tag)).sendMessage(reply);
				});
			}
		}

		notif.show();
	}

	async initWhatsapp() {
		this.loadURL('about:blank', { userAgent }).then(async () => {
			const pieBrowser = await pie.connect(app, puppeteer);

			console.log('Creating whatsapp client');
			this.whatsapp = new Client(pieBrowser, this);
			this.whatsappReady = false;

			this.whatsapp.on('ready', () => {
				console.log('Whatsapp client ready');
				this.whatsappReady = true;
				this.webContents.send('ready', this._id);
				this.emit('ready');
			});

			// this.whatsapp.on("change_battery", (batteryInfo) => {
			// 	if (batteryInfo.battery <= 15 && batteryInfo.battery % 5 == 0 && batteryInfo.plugged == false) {
			// 		this.notify('lowBattery');
			// 	}
			// });

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
					}
				}
			});

			this.whatsapp.on('disconnected', (reason) => {
				console.log(`\nWarning! Client disconnected. Reason: ${reason}\n`);
				this.whatsapp.removeAllListeners();
				delete this.whatsapp;
				// FIXME: for some reason web.whatsapp.com failed to load without the delay
				setTimeout(() => this.initWhatsapp(), 2000);
			});

			this.whatsapp.initialize();
		});
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
		const chats = await this.whatsapp.getChats()
		chats.forEach(async (chat) => {
			await chat.sendSeen();
		});
	}

	async openChat(phoneNumber) {
		phoneNumber = phoneNumber.replace(/\D/g, '');
		try {
			await this.whatsapp.interface.openChatWindow(`${phoneNumber}@c.us`);
			return {
				success: true,
				message: '',
			};
		} catch(err) {
			console.error(`Error when opening number "${phoneNumber}"`, err);
			return {
				success: false,
				message: 'Failed to open phone number',
			};
		}
	}

	integrateToDesktop() {
		const shortcutDir = path.join(homedir, ".local/share/applications");
		const iconDir = path.join(homedir, ".local/share/WALC");
		const iconPath = path.join(iconDir, "logo360x360.png");
		fs.mkdirSync(shortcutDir, { recursive: true });
		fs.mkdirSync(iconDir, { recursive: true });
		fs.copyFileSync(ICON_PATH, iconPath);
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
