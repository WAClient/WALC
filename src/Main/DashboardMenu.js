/**
 * @param {string} id
 * @param {boolean} darkTheme
 * @param {import('./InstanceManager')} instanceManager
 */
module.exports = function DashboardMenu(id, darkTheme, instanceManager) {
	const window = instanceManager.instances[id].main;
	return [
		{
			label: 'Open Dashboard',
			accelerator: 'Ctrl+D',
			click: () => {
				instanceManager.openDashboard(id, darkTheme);
			},
		}, {
			label: 'Quit',
			accelerator: 'Ctrl+Q',
			click: () => {
				window.isQuiting = true;
				window.close();
			},
		},
	];
}