const { ipcRenderer } = require('electron');
const Settings = require('./Settings');

class LegacyNotification extends Notification {
	constructor(title, options) {
		if(Settings.get('notification.enabled.value')) {
			const { tag, renotify, ...filteredOptions } = options;
			// console.log('notify', options);

			super(title, filteredOptions);
			this.addEventListener('click', function () {
				ipcRenderer.send('focusWindow');
			});
		}
	}
}

class ServerNotification {
	constructor(title, options = {}) {
		// console.log('notify', options);
		this.__serverNotif(title, options);
	}

	async __serverNotif(title, options) {
		if(options.tag) {
			try {
				/**
				 * parse encoded tag, format (without square brackets):
				 * 
				 * [boolean]_[user-serialized-id]_[alphanumeric]
				 * 
				 * NOTE: what the boolean and alphanumeric value is for is currently unknown
				 * FIXME: parsing should be done server side, the other data could be useful
				 */
				const match = options.tag.match(/\w+_(\d+@c.us)_/);
				if (match && match.length && match[1]) {
					await window.Store?.Contact?.find(match[1]);
					options.tag = match[1];
				}
			} catch(err) {
				delete options.tag;
			}
		}
		const serverNotif = {
			...options,
			title,
			icon: await this.__getIcon(options.icon),
		};
		ipcRenderer.invoke('instance.main.chatNotification', 'walc', serverNotif);
	}

	__getIcon(icon) {
		if(!icon) return;
		return new Promise((resolve, reject) => {
			fetch(icon)
				.then((r) => r.blob())
				.catch(reject)
				.then((blob) => {
					const reader = new FileReader();
					reader.onload = (event) => resolve(event.target.result);
					reader.readAsDataURL(blob);
				});
		});
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