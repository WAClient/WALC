const { ipcRenderer } = require('electron');
const Settings = require('./Settings');

class LegacyNotification extends Notification {
	constructor(title, options) {
		if(Settings.get('notification.enabled.value')) {
			const { tag, renotify, ...filteredOptions } = options;
			// console.log('notify legacy', options);

			super(title, filteredOptions);
			this.addEventListener('click', function () {
				ipcRenderer.send('focusWindow');
			});
		}
	}
}

class ServerNotification {
	constructor(title, options = {}) {
		// console.log('notify server', options);
		this.__serverNotif(title, options);
	}

	async __serverNotif(title, options) {
		if(options.tag) {
			try {
				const match = options.tag.match(/(\d+@c.us)/);
				if (match && match.length && match[1]) {
					await window.Store?.Contact?.find(match[1]);
					options.tag = match[1];
				} else {
					delete options.tag;
				}
			} catch(err) {
				delete options.tag;
			}
		}
		/**
		 * NOTE: Sending non-standard JavaScript types such as DOM objects or special Electron objects will throw an exception.
		 * The options object potentially contains function
		 * @see https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrenderersendchannel-args
		 */
		const serverNotif = JSON.parse(JSON.stringify({
			...options,
			title,
			icon: await this.__getIcon(options.icon),
		}));
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