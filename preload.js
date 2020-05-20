const { remote, ipcRenderer } = require('electron');
const Store = require('electron-store');

const settings = new Store({ name: 'settings' });

// override Notification API so it can show the window on click
window.oldNotification = Notification;
window.Notification = function(title, options) {
	const n = new window.oldNotification(title, options);
	n.addEventListener('click', function() {
		const win = remote.getCurrentWindow();
		if(!win.isVisible()) win.show();
		win.focus();
	});
	return n;
};
Object.assign(window.Notification, window.oldNotification);

function renderTray() {
	const chats = window.Store.Chat.getModelsArray();
	let allMuted = settings.get('countMuted.value');
	let unread = chats.reduce((total, chat) => {
		// don't count if user disable counter on muted chats
		if(!settings.get('countMuted.value') && chat.mute.isMuted) {
			return total;
		}
		if(chat.unreadCount > 0 && !chat.mute.isMuted) {
			allMuted = false;
		}
		return total + chat.unreadCount;
	}, 0);
	const canvas = document.createElement('canvas');
	const logo = new Image();
	const ctx = canvas.getContext('2d');

	logo.onload = () => {
		canvas.width = logo.naturalWidth;
		canvas.height = logo.naturalHeight;

		if(window.Store.AppState.state !== 'CONNECTED') {
			ctx.filter = 'grayscale(100%)';
		}
		ctx.drawImage(logo, 0, 0);
		ctx.filter = 'none';
		if(unread > 0) {
			unread = (unread > 99 ? 99 : unread);
			if(allMuted) {
				ctx.fillStyle = 'gray';
			} else {
				ctx.fillStyle = 'red';
			}
			ctx.arc(45, 18, 18, 0, 2*Math.PI);
			ctx.fill();
			ctx.fillStyle = 'white';
			ctx.font = (unread < 10 ? '28' : '24')+'px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(unread, 45, 18);
		}

		ipcRenderer.send('renderTray', canvas.toDataURL());
	};
	logo.src = 'favicon.ico';
}

function appStateChange(event, state) {
	if(['OPENING', 'DISCONNECTED', 'TIMEOUT'].includes(state)) {
		setTimeout(() => {
			if (state === window.Store.AppState.state) {
				new Notification('WALC disconnected', {
					body: "Please check your connection.",
					icon: "favicon.ico"
				});
			}
			renderTray();
		}, 3000);
	} else if(state === 'CONNECTED') {
		renderTray();
	}
}

function storeOnLoad() {
	if(window.Store) {
		renderTray();
		window.Store.Chat.on('change:unreadCount', renderTray);
		window.Store.Chat.on('change:muteExpiration', renderTray);
		window.Store.AppState.on('change:state', appStateChange);
	} else {
		setTimeout(storeOnLoad, 1000);
	}
}

function applySettings() {
	if(settings.get('darkMode.value')) {
		enableDarkMode();
	} else {
		disableDarkMode();
	}	
}

function enableDarkMode() {
	document.body.classList.add("dark");
}
function disableDarkMode() {
	document.body.classList.remove("dark");
}

window.addEventListener('load', storeOnLoad);
window.addEventListener('load', applySettings);
ipcRenderer.on('renderTray', renderTray);
ipcRenderer.on('enableDarkMode', enableDarkMode);
ipcRenderer.on('disableDarkMode', disableDarkMode);