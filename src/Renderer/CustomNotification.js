const { ipcRenderer } = require('electron');
const Settings = require('./Settings');

class LegacyNotification extends Notification {
	constructor(title, options) {
		if(Settings.get('notification.enabled.value')) {
			const { tag, renotify, ...filteredOptions } = options;
			console.log('notify', options);

			super(title, filteredOptions);
			this.addEventListener('click', function () {
				ipcRenderer.send('focusWindow');
			});
		}
	}
}

class ServerNotification {
	constructor(title, options) {
		console.log('notify', options);
		this.serverNotif(title, options);
	}

	async serverNotif(title, options) {
		try {
			await window.Store?.Contact?.find(options.tag);
			const blob = await fetch(options.icon).then((r) => r.blob());

			const reader = new FileReader();
			reader.onload = (event) => {
				const serverNotif = {
					...options,
					title,
					icon: event.target.result,
				};
				ipcRenderer.invoke('instance.main.chatNotification', 'walc', serverNotif);
			};
			reader.readAsDataURL(blob);
		} catch(err) {
			console.log('Server notification error', err)
		}
	}

	static permission = 'granted';
	static maxActions = 3;

	static requestPermission(callback) {
		return new Promise((resolve, reject) => {
			if(typeof callback === 'function') {
				callback('granted');
			}
			resolve('granted');
		});
	}

	close() {
		// TODO: close server notification early
	}
}

module.exports = {
	LegacyNotification,
	ServerNotification,
}