const { ipcRenderer } = require('electron');

class Settings {
	get(key = null) {
		return ipcRenderer.sendSync('getSettings', key);
	}
	set(values = {}) {
		return ipcRenderer.sendSync('setSettings', values);
	}
}

module.exports = new Settings();