const { ipcRenderer } = require('electron');
const EventEmitter = require('events');

const settingsEmitter = new EventEmitter();

class Settings {
	constructor() {
		ipcRenderer.on('settingsChange', (event, key, value) => {
			settingsEmitter.emit(key, value);
		});
	}
	get(key = null) {
		return ipcRenderer.sendSync('getSettings', key);
	}
	set(values = {}) {
		return ipcRenderer.sendSync('setSettings', values);
	}
	onDidChange(key, handler) {
		settingsEmitter.addListener(key, handler);
		ipcRenderer.send('watchSettings', key);
	}
}

module.exports = new Settings();