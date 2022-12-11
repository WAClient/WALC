const settings = require('./settings');

/**
 * @param {string} id
 * @param {import('./MainWindow')} window
 * @param {import('./InstanceManager')} instanceManager
 */
module.exports = async function MainMenu(id, window, instanceManager) {
	let chats = await window.whatsapp.getChats();
	// need to update the index on message
	window.whatsapp.on('message', async () => {
		chats = await window.whatsapp.getChats();
	});
	const appLock = settings.get('appLock');

	const chatMenu = [];

	chatMenu.push({
		label: 'New Chat',
		accelerator: 'Ctrl+N',
		click: () => {
			instanceManager.newChat();
		},
	})

	for(let i = 0; i < 9; i++) {
		const num = i + 1;
		chatMenu.push({
			label: `Open Chat ${num}`,
			accelerator: `Ctrl+${num}`,
			click: () => {
				window.whatsapp.interface.openChatWindow(chats[i].id._serialized);
			},
		});
	}
	
	return [
		{
			label: 'WALC',
			submenu: [
				{
					label: 'Open Dashboard',
					accelerator: 'Ctrl+D',
					click: () => {
						instanceManager.openDashboard(id);
					},
				},
				...(!appLock.enabled.value ? [] : [{
					label: 'Lock App',
					accelerator: 'Ctrl+L',
					click: () => {
						instanceManager.instances[id].appLock.lock();
					}
				}]),
				{
					label: 'Quit',
					accelerator: 'Ctrl+Q',
					click: () => {
						window.isQuiting = true;
						window.close();
					},
				}, {
					label: 'Toggle Developer Tools',
					accelerator: 'Ctrl+Shift+I',
					click: () => {
						window.webContents.toggleDevTools();
					},
				}, {
					role: 'resetZoom',
				}, {
					role: 'zoomIn',
				}, {
					role: 'zoomOut',
				},
			],
		}, {
			label: 'Chats',
			submenu: chatMenu,
		}
	];
}