const { ipcRenderer } = require('electron');
const Instance = require('./Instance');


class AppLock {
	constructor() {
		this.initIPC();
		this.overlay = document.createElement('div');
		this.overlay.classList.add('app-lock', 'unlocked');
		document.body.append(this.overlay);

		this.whatsappInitialized = false;
		this.user = {
			name: '',
			img: '',
		};
	}

	async initWhatsapp() {
		if(this.whatsappInitialized) return;
		const user = window.Store.User.getMeUser() || {};
		const meContact = await window.Store.Contact.find(user._serialized);
		this.user.name = meContact.displayName;
		this.user.img = meContact.getProfilePicThumb().img;
		this.whatsappInitialized = true;
	}

	initIPC() {
		ipcRenderer.on('appLock.lock', () => this._lock());
		ipcRenderer.on('appLock.unlock', () => this._unlock());
	}

	lock() {
		Instance.exec('appLock.lock');
	}

	async unlock(password) {
		const result = await Instance.exec('appLock.unlock', password);
		if(result) {
			this._unlock();
		}
	}

	async _lock() {
		await this.initWhatsapp();
		this.overlay.innerHTML = `
			<div class="app-lock-user">
				<img src="${this.user.img}" />
				<h1>${this.user.name}</h1>
			</div>
			<input class="app-lock-input" placeholder="Password" type="password" />
		`;
		this.overlay.classList.remove('unlocked');
	}

	_unlock() {
		this.overlay.classList.add('unlocked');
	}
}

module.exports = AppLock;
