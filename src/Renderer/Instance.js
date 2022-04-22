const { ipcRenderer } = require('electron');
const { LegacyNotification, ServerNotification } = require('./CustomNotification');
const Settings = require('./Settings');

class Instance {
	id = null;

	async exec(key, ...args) {
		if(this.id === null) {
			this.id = await ipcRenderer.invoke('getInstanceID');
		}
		return ipcRenderer.invoke(`instance.${key}`, this.id, ...args);
	}

	init(dashboard_icon) {
		this.initNotification();
		this.installDashboardIcon(dashboard_icon);
		this.observeTheme();
	}

	initNotification() {
		// override Notification API so it can show the window on click
		window.oldNotification = Notification;
		Settings.onDidChange('notification.legacyType', this.setNotification);
		this.setNotification();
	}

	setNotification() {
		if(Settings.get('notification.legacyType.value')) {
			window.Notification = LegacyNotification;
		} else {
			window.Notification = ServerNotification;
		}
	}

	installDashboardIcon(icon) {
		const container = document.querySelector('#side header div:first-child');
		const image = new Image();
		container.style.display = 'flex';
		container.style.alignItems = 'center';
		image.src = icon;
		image.title = 'Open Dashboard';
		image.style = `
			display: block;
			margin-left: auto;
			margin-right: 16px;
			width: 30px;
			height: 30px;
			cursor: pointer;
		`;
		image.addEventListener('click', () => {
			this.exec('openDashboard');
		});
		image.addEventListener('contextmenu', () => {
			this.exec('dashboard-context-menu');
		});
		container.appendChild(image);
	}

	observeTheme() {
		this.exec('setDarkTheme', document.body.classList.contains('dark'));
		const observer = new MutationObserver(() => {
			this.exec('setDarkTheme', document.body.classList.contains('dark'));
		});
	
		observer.observe(document.body, {
			attributes: true, 
			attributeFilter: ['class'],
			childList: false, 
			characterData: false
		});
	}
}

module.exports = new Instance();