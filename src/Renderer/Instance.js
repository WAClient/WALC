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
		const container = document.querySelector('[data-testid=chatlist-header] div:first-child');
		this.image = document.createElement('div');
		container.style.display = 'flex';
		container.style.alignItems = 'center';
		this.image.title = 'Open Dashboard';
		this.image.style = `
			display: block;
			margin-left: auto;
			margin-right: 16px;
			width: 30px;
			height: 30px;
			cursor: pointer;
			color: var(--panel-header-icon);
		`;
		this.image.innerHTML = icon;

		this.image.addEventListener('click', () => {
			this.exec('openDashboard');
		});
		this.image.addEventListener('contextmenu', () => {
			this.exec('dashboard-context-menu');
		});
		container.appendChild(this.image);
	}

	observeTheme() {
		const isDark = document.body.classList.contains('dark');
		this.exec('setDarkTheme', isDark);

		const observer = new MutationObserver(() => {
			const isDark = document.body.classList.contains('dark');
			this.exec('setDarkTheme', isDark);
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