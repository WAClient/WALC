const { ipcRenderer } = require('electron');

let instanceID;
let icon = ipcRenderer.invoke('getIcon').then((value) => icon = value);

const settings = {
	get: (key = null) => ipcRenderer.invoke('getSettings', key),
	set: (values = {}) => ipcRenderer.invoke('setSettings', values),
};

async function instanceExec(key, ...args) {
	return ipcRenderer.invoke(`instance.${key}`, instanceID, ...args);
}

// override Notification API so it can show the window on click
window.oldNotification = Notification;
window.Notification = async function (title, options) {
	if(await settings.get('notification.enabled')) {
		const n = new window.oldNotification(title, options);
		n.addEventListener('click', function () {
			ipcRenderer.send('focusWindow');
		});
		return n;
	}
};
Object.assign(window.Notification, window.oldNotification);

const badge = {
	x: 180,
	y: 180,
	radius: 120,
	font: 172,
	fontSmall: 124,
};

async function renderTray() {
	let unread = 0;
	const countMuted = await settings.get('countMuted.value');
	let allMuted = countMuted;
	if(window.Store && window.Store.Chat) {
		const chats = window.Store.Chat.getModelsArray();
		unread = chats.reduce((total, chat) => {
			// don't count if user disable counter on muted chats
			if (!countMuted && chat.mute.isMuted) {
				return total;
			}
			if (chat.unreadCount > 0 && !chat.mute.isMuted) {
				allMuted = false;
			}
			return total + chat.unreadCount;
		}, 0);
	}
	const canvas = document.createElement('canvas');
	const logo = new Image();
	const ctx = canvas.getContext('2d');

	logo.onload = () => {
		canvas.width = logo.naturalWidth;
		canvas.height = logo.naturalHeight;

		if(!window.Store || window.Store.AppState.state !== 'CONNECTED') {
			ctx.filter = 'grayscale(100%)';
		}
		ctx.drawImage(logo, 0, 0);
		ctx.filter = 'none';
		if (unread > 0) {
			unread = (unread > 99 ? 99 : unread);
			if (allMuted) {
				ctx.fillStyle = 'gray';
			} else {
				ctx.fillStyle = 'red';
			}
			ctx.arc(badge.x, badge.y, badge.radius, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillStyle = 'white';
			ctx.font = (unread < 10 ? badge.font : badge.fontSmall) + 'px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(unread, badge.x, badge.y);
		}

		ipcRenderer.send('renderTray', canvas.toDataURL());
	};
	logo.src = icon;
}

function appStateChange(event, state) {
	if (['OPENING', 'DISCONNECTED', 'TIMEOUT'].includes(state)) {
		setTimeout(() => {
			if (state === window.Store.AppState.state) {
				new Notification('WALC disconnected', {
					body: "Please check your connection.",
					icon: icon,
				});
			}
			renderTray();
		}, 5000);
	} else if (state === 'CONNECTED') {
		renderTray();
	}
}

function setFullWidth(status) {
	/** @type {HTMLDivElement} */
	const container = document.querySelector('#app > .app-wrapper-web > div');
	if(status) {
		container.style.width = '100%';
		container.style.height = '100%';
		container.style.top = '0';
	} else {
		container.removeAttribute('style');
	}
}

function installAppIcon() {
	const container = document.querySelector('#side header div:first-child');
	const image = new Image();
	container.style.display = 'flex'
	container.style.alignItems = 'center'
	image.src = icon
	image.title = 'Open Dashboard';
	image.style = `
		display: block;
		margin-left: auto;
		margin-right: 16px;
		width: 30px;
		height: 30px;
		cursor: pointer;
	`;
	image.addEventListener('click', () => {
		const darkTheme = document.body.classList.contains('dark');
		instanceExec('openDashboard', darkTheme);
	});
	image.addEventListener('contextmenu', () => {
		const darkTheme = document.body.classList.contains('dark');
		instanceExec('dashboard-context-menu', darkTheme);
	});
	container.appendChild(image);
}

function ready(id) {
	instanceID = id;
	if(icon instanceof Promise) {
		icon.then(() => storeOnLoad());
		return;
	}
	renderTray();
	installAppIcon();
	window.Store.Chat.on('change:unreadCount', renderTray);
	window.Store.Chat.on('change:muteExpiration', renderTray);
	window.Store.AppState.on('change:state', appStateChange);
}

window.WALC = {
	load: () => ipcRenderer.send('loadWA'),
};

ipcRenderer.on('renderTray', renderTray);
ipcRenderer.on('ready', (e, id) => ready(id));
ipcRenderer.on('darkTheme', (e) => {
	ipcRenderer.send('darkTheme-reply', document.body.classList.contains('dark'));
});
ipcRenderer.on('setFullWidth', (e, status) => setFullWidth(status))
