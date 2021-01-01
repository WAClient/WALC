const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const settings = new Store({ name: 'settings' });
const times = [5, 10, 30, 60];
let index = 0;
let counter = times[index];
let timeout;
const retryText = document.getElementById('retry-text');
const retryButton = document.getElementById('retry-button');

function resetCounter() {
	retryButton.disabled = false;
	if(index < times.length - 1) {
		index++;
	}
	counter = times[index];
	count();
}

function liveCheck() {
	clearTimeout(timeout);
	retryButton.disabled = true;
	retryText.innerHTML = 'Retrying...';
	ipcRenderer.send('liveCheck');
}

function count() {
	if(counter > 0) {
		retryText.innerHTML = `Retrying in ${counter} seconds`;
		timeout = setTimeout(() => {
			counter--;
			count();
		}, 1000);
	} else {
		liveCheck();
	}
}

ipcRenderer.on('offline', resetCounter);
retryButton.addEventListener('click', liveCheck);
window.addEventListener('online', () => setTimeout(liveCheck, 1000));
count();
