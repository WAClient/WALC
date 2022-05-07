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
		this.image = new Image();
		this.image.src = icon;
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
		`;

		this.image.addEventListener('click', () => {
			this.exec('openDashboard');
		});
		this.image.addEventListener('contextmenu', () => {
			this.exec('dashboard-context-menu');
		});
		container.appendChild(this.image);
	}



	setDashboardIconTheme(isDark) {

		if (isDark) {
			this.image.style.webkitFilter = "invert(82%) sepia(8%) saturate(328%) hue-rotate(158deg) brightness(90%) contrast(89%)";
		} else {
			this.image.style.webkitFilter = "invert(38%) sepia(3%) saturate(2487%) hue-rotate(159deg) brightness(95%) contrast(85%)";
		}
	}

	observeTheme() {
		const isDark = document.body.classList.contains('dark');
    	this.exec('setDarkTheme', isDark);
    	this.setDashboardIconTheme(isDark);

    	const observer = new MutationObserver(() => {
        const isDark = document.body.classList.contains('dark');
        this.exec('setDarkTheme', isDark);
        this.setDashboardIconTheme(isDark);

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