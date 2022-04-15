const { powerMonitor } = require('electron');
const settings = require('./settings');
const bcrypt = require('bcrypt');
const { EventEmitter } = require('events');
const DBus = require('dbus');

module.exports = class AppLock extends EventEmitter {
	/** @param {import('./MainWindow')} mainWindow */
	constructor(mainWindow) {
		super();
		this.mainWindow = mainWindow;
		this._timeout = null;
	}

	init() {
		this.idleTime = 0;
		setInterval(() => {
			this.idleTime += 1000;
		}, 1000);

		this.settings = settings.get('appLock');
		settings.onDidChange('appLock', () => {
			this.resetTimer();
			this.settings = settings.get('appLock');
		});

		this.resetTimer();

		this.bus = DBus.getBus('session');
		this.bus.getInterface(
			'org.freedesktop.ScreenSaver', 
			'/ScreenSaver', 
			'org.freedesktop.ScreenSaver',
			(err, iface) => {
				iface.on('ActiveChanged', (active) => {
					if(this.settings.lockOnScreenLock.value && active === true) {
						this.lock();
					}
				});
				iface.GetActive((err, active) => {
					if(this.settings.lockOnScreenLock.value && active === true) {
						setTimeout(() => this.lock(), 500);
					}
				});
			}
		);
	}

	get isEnabled() {
		return (!!this.settings.enabled.value && !!this.settings.password);
	}

	activity() {
		this.idleTime = 0;
	}

	lock() {
		if(!this.isEnabled) {
			return;
		}
		this.clearTimer();
		this.mainWindow.webContents.send('appLock.lock');
		this.emit('lock');
	}

	async unlock(password) {
		if(!await this.checkPassword(password)) {
			await new Promise((r) => setTimeout(r, 1000));
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
		if(!this.settings.password.value) {
			return true;
		}
		return bcrypt.compare(password, this.settings.password.value);
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

		const timeout = this.settings.timeout.value * 1000;

		if(this.idleTime > timeout) {
			this.lock();
		} else {
			this._timeout = setTimeout(() => {
				this.resetTimer();
			}, timeout - this.idleTime);
		}
	}

	clearTimer() {
		if(this._timeout === null) return;
		clearTimeout(this._timeout);
		this._timeout = null;
	}
}