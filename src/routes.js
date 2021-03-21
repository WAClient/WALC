import Vue from 'vue';
import VueRouter from 'vue-router';

import Dashboard from './Pages/Dashboard';
import Settings from './Pages/Settings';
import SettingsGeneral from './Pages/Settings/General';
import SettingsNotification from './Pages/Settings/Notification';
import SettingsTrayIcon from './Pages/Settings/TrayIcon';
import SettingsAdvanced from './Pages/Settings/Advanced';
import Offline from './Pages/Offline';

function groupRoutes(config, routes) {
	if(typeof routes === 'function') {
		routes = routes();
	}
	return routes.map(route => {
		if(config.prefix) {
			route.path = config.prefix + '/' + route.path.replace(/^\//, '');
		}
		if(config.as) {
			route.name = config.as + route.name;
		}
		return route;
	});
}

Vue.use(VueRouter);
const routes = [
	{
		path: '/',
		component: Dashboard,
		name: 'dashboard',
	}, {
		path: '/settings',
		component: Settings,
		name: 'settings'
	},
	...groupRoutes({ prefix: '/settings', as: 'settings.' }, [
		{
			path: '/general',
			component: SettingsGeneral,
			name: 'general',
		}, {
			path: '/notification',
			component: SettingsNotification,
			name: 'notification',
		}, {
			path: '/tray-icon',
			component: SettingsTrayIcon,
			name: 'tray-icon',
		}, {
			path: '/advanced',
			component: SettingsAdvanced,
			name: 'advanced',
		},
	]),
	{
		path: '/offline',
		component: Offline,
		name: 'offline,'
	}
];

export default new VueRouter({ routes });
