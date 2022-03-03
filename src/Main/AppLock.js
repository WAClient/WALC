const { powerMonitor } = require('electron');
const settings = require('./settings');
const bcrypt = require('bcrypt');
const { EventEmitter } = require('events');

module.exports = class AppLock extends EventEmitter {
	/** @param {import('./MainWindow')} mainWindow */
	constructor(mainWindow) {
		super();
		this.mainWindow = mainWindow;
		this._timeout = null;

		const appLock = settings.get('appLock');
		this.settings = Object.keys(appLock)
			.reduce((settings, key) => {
				settings[key] = appLock[key].value;
				return settings;
			}, {});

		settings.onDidChange('appLock', () => {
			this.resetTimer();
		});

		this.resetTimer();
	}

	get isEnabled() {
		return !!this.settings.enabled;
	}

	lock() {
		this.clearTimer();
		this.mainWindow.webContents.send('appLock.lock');
		this.emit('lock');
	}

	async unlock(password) {
		if(!await this.checkPassword(password)) {
			return {
				status: false,
				message: 'Your password is incorrect',
			};
		}
		this.resetTimer();
		this.mainWindow.webContents.send('appLock.unlock');
		this.emit('unlock');
		return { status: true };
	}

	checkPassword(password) {
		if(!this.settings.password) {
			return true;
		}
		return bcrypt.compare(password, this.settings.password);
	}

	async setPassword(password, oldPassword) {
		if(!await this.checkPassword(oldPassword)) {
			return {
				status: false,
				message: 'Old password is not valid',
			};
		}

		const hash = await bcrypt.hash(password, 10);
		settings.set('appLock.password.value', hash);
		return {
			status: true,
			message: 'Password changed successfully',
		};
	}

	resetTimer() {
		if(!this.isEnabled) {
			this.clearTimer();
			return;
		}

		const idleTime = powerMonitor.getSystemIdleTime();
		const timeout = this.settings.timeout;

		if(idleTime > timeout) {
			this.lock();
		} else {
			this._timeout = setTimeout(() => {
				this.resetTimer();
			}, timeout - idleTime);
		}
	}

	clearTimer() {
		if(this._timeout === null) return;
		clearTimeout(this._timeout);
		this._timeout = null;
	}
}