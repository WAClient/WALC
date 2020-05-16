const { remote, ipcRenderer } = require('electron');

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
	let unread = chats.reduce((total, chat) => total + chat.unreadCount, 0);
	const canvas = document.createElement('canvas');
	const logo = new Image();
	const ctx = canvas.getContext('2d');

	logo.onload = () => {
		canvas.width = logo.naturalWidth;
		canvas.height = logo.naturalHeight;

		ctx.drawImage(logo, 0, 0);
		if(unread > 0) {
			unread = (unread > 99 ? 99 : unread);
			ctx.fillStyle = 'red';
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

function addUnreadEvent() {
	if(window.Store) {
		renderTray();
		window.Store.Chat.on('change:unreadCount', renderTray);
	} else {
		setTimeout(addUnreadEvent, 1000);
	}
}

function windowOnLoad() {
	addUnreadEvent();
}

function enableDarkMode() {
	document.body.classList.add("dark");
}
function disableDarkMode() {
	document.body.classList.remove("dark");
}

window.addEventListener('load', windowOnLoad);
ipcRenderer.on('enableDarkMode', enableDarkMode);
ipcRenderer.on('disableDarkMode', disableDarkMode);