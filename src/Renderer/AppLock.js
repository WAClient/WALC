const { ipcRenderer } = require('electron');
const Instance = require('./Instance');

const ActivityChecker = {
	events: ['mousemove', 'click', 'scroll', 'input'],
	cooldown: 2000,
	onCooldown: false,

	init() {
		this.events.forEach((evt) => {
			window.addEventListener(evt, this.handler.bind(this));
		})
	},

	handler() {
		if(this.onCooldown) return;
		Instance.exec('appLock.activity');
		this.onCooldown = true;
		setTimeout(() => {
			this.onCooldown = false;
		}, this.cooldown);
	},
}

class AppLock {
	constructor() {
		this._initIPC();
		this._initOverlay();
		setTimeout(() => this._initWhatsapp(), 1000);

		ActivityChecker.init();
	}

	_initIPC() {
		ipcRenderer.on('appLock.lock', () => this._lock());
		ipcRenderer.on('appLock.unlock', () => this._unlock());
	}

	_initOverlay() {
		this.overlay = document.createElement('div');
		this.overlay.classList.add('app-lock', 'unlocked');
		this.overlay.innerHTML = `
			<div class="app-lock-container">
				<div class="app-lock-user">
					<img src="" />
					<h1></h1>
				</div>
				<input class="app-lock-input" placeholder="Password" type="password" />
			</div>
		`;
		document.body.append(this.overlay);

		const input = this.overlay.querySelector('.app-lock-input');
		input.addEventListener('keydown', async (event) => {
			if(event.key === 'Enter') {
				this._submit(input);
			}
		});
	}

	async _initWhatsapp() {
		const user = window.Store.User.getMeUser() || {};
		const myContact = await window.Store.Contact.find(user._serialized);
		this.overlay.querySelector('.app-lock-user h1').textContent = myContact.displayName;
		this.overlay.querySelector('.app-lock-user img').src = myContact.getProfilePicThumb().img;
	}

	/** @param {HTMLInputElement} input */
	async _submit(input) {
		input.disabled = true;
		const result = await this.unlock(input.value);
		if(result.status) {
			input.value = '';
		} else {
			input.classList.add('error');
			setTimeout(() => {
				input.classList.remove('error');
			}, 3000);
			setTimeout(() => {
				input.focus();
				input.select();
			}, 100);
		}
		input.disabled = false;
	}

	lock() {
		Instance.exec('appLock.lock');
	}

	async unlock(password) {
		const result = await Instance.exec('appLock.unlock', password);
		if(result.status) {
			this._unlock();
		}
		return result;
	}

	async _lock() {
		this.overlay.classList.remove('unlocked');
		this.overlay.classList.remove('fade-out');
		this.overlay.classList.add('fade-in');
		setTimeout(() => {
			this.overlay.querySelector('.app-lock-input').focus();
		});
	}

	_unlock() {
		this.overlay.classList.remove('fade-in');
		this.overlay.classList.add('fade-out');
		setTimeout(() => this.overlay.classList.add('unlocked'), 500);
	}
}

module.exports = AppLock;
