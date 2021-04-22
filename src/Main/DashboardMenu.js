/**
 * @param {string} id
 * @param {import('./InstanceManager')} instanceManager
 */
module.exports = function DashboardMenu(id, instanceManager) {
	const window = instanceManager.instances[id].main;
	return [
		{
			label: 'Open Dashboard',
			accelerator: 'Ctrl+D',
			click: () => {
				instanceManager.openDashboard(id);
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