const settings = require('./settings');

/**
 * @param {string} id
 * @param {import('./InstanceManager')} instanceManager
 */
module.exports = function DashboardMenu(id, instanceManager) {
	const window = instanceManager.instances[id].main;
	const appLock = settings.get('appLock');
	return [
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
		},
	];
}