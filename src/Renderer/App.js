const { ipcRenderer } = require('electron');
const Settings = require('./Settings');
const Instance = require('./Instance');
const AppLock = require('./AppLock');
const fs = require('fs');

class App {
	constructor() {
		console.log('Initializing WALC');
		this.initialized = false;
		this.awaitApp();
		ipcRenderer.on('renderTray', () => this.renderTray());
		ipcRenderer.on('ready', () => this.init());
		ipcRenderer.on('setFullWidth', (e, status) => this.setFullWidth(status));

		window.WALC = {
			load: () => Instance.exec('main.initWhatsapp'),
			renderTray: () => this.renderTray(),
		};
	}

	awaitApp() {
		const observer = new MutationObserver(() => {
			const sidebar = document.querySelector('#app #side header');
			if(sidebar) {
				setTimeout(() => this.init(), 1000);
				observer.disconnect();
			}
		});

		setTimeout(() => {
			observer.observe(document, {
				childList: true,
				subtree: true,
			});
		}, 2000);
	}

	async init() {
		if(this.initialized) return;
		this.initialized = true;

		this.appLock = new AppLock();

		const style = document.createElement('style');
		style.innerHTML = await ipcRenderer.invoke('getStyle');
		document.head.appendChild(style);

		this.icon = await ipcRenderer.invoke('getIcon');
		this.dashboard_icon = await ipcRenderer.invoke('getDashboardIcon')
		Instance.init(this.dashboard_icon);
		this.renderTray();
		if(window.Store?.Chat) {
			window.Store.Chat.on('change:unreadCount', () => this.renderTray());
			window.Store.Chat.on('change:muteExpiration', () => this.renderTray());
			window.Store.AppState?.on('change:state', (...args) => this.appStateChange(...args));
		}

		console.log('WALC Initialized');
	}

	renderTray() {
		const badge = {
			x: 180,
			y: 180,
			radius: 115,
			font: 172,
			fontSmall: 124,
		};
		let unread = 0;
		const countMuted = Settings.get('trayIcon.countMuted.value');
		let allMuted = countMuted;
		if(window.Store?.Chat) {
			const chats = window.Store.Chat.getModelsArray();
			unread = chats.reduce((total, chat) => {
				// don't count if user disable counter on muted chats
				if (!countMuted && chat.mute.isMuted) {
					return total;
				}
				if (chat.unreadCount > 0 && !chat.mute.isMuted) {
					allMuted = false;
				}
				return total + chat.unreadCount;
			}, 0);
		}
		const canvas = document.createElement('canvas');
		const logo = new Image();
		const ctx = canvas.getContext('2d');
	
		logo.onload = () => {
			canvas.width = logo.naturalWidth;
			canvas.height = logo.naturalHeight;
	
			if(!window.Store || window.Store.AppState.state !== 'CONNECTED') {
				ctx.filter = 'grayscale(100%)';
			}
			ctx.drawImage(logo, 0, 0);
			ctx.filter = 'none';
			if (unread > 0) {
				const fontSize = (unread < 10 ? badge.font : badge.fontSmall)
				unread = (unread > 99 ? 99 : unread);
				if (allMuted) {
					ctx.fillStyle = 'gray';
				} else {
					ctx.fillStyle = 'red';
				}
				ctx.arc(badge.x, badge.y, badge.radius, 0, 2 * Math.PI);
				ctx.fill();
				ctx.fillStyle = 'white';
				ctx.font = `bold ${fontSize}px sans-serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(unread, badge.x, badge.y);
			}
	
			ipcRenderer.send('renderTray', canvas.toDataURL());
		};
		logo.src = this.icon;
	}

	appStateChange(event, state) {
		if (['OPENING', 'DISCONNECTED', 'TIMEOUT'].includes(state)) {
			setTimeout(() => {
				if (state === window.Store.AppState.state) {
					new Notification('WALC disconnected', {
						body: 'Please check your connection.',
					});
				}
				this.renderTray();
			}, 5000);
		} else if (state === 'CONNECTED') {
			this.renderTray();
		}
	}

	setFullWidth(status) {
		/** @type {HTMLDivElement} */
		const container = document.querySelector('#app > .app-wrapper-web > div');
		if(status) {
			container.style.width = '100%';
			container.style.height = '100%';
			container.style.top = '0';
		} else {
			container.removeAttribute('style');
		}
	}
}

new App();
