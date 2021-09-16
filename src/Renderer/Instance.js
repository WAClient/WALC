const { ipcRenderer } = require('electron');

class Instance {
	id = null;

	async exec(key, ...args) {
		if(this.id === null) {
			this.id = await ipcRenderer.invoke('getInstanceID');
		}
		return ipcRenderer.invoke(`instance.${key}`, this.id, ...args);
	}

	init(icon) {
		this.initNotification();
		this.installAppIcon(icon);
		this.observeTheme();
	}

	initNotification() {
		// override Notification API so it can show the window on click
		window.oldNotification = Notification;
		window.Notification = function (title, options) {
			if(Settings.get('notification.enabled.value')) {
				const n = new window.oldNotification(title, options);
				n.addEventListener('click', function () {
					ipcRenderer.send('focusWindow');
				});
				return n;
			}
		};
		Object.assign(window.Notification, window.oldNotification);
	}

	installAppIcon(icon) {
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