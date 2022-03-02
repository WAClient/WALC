import Vue from 'vue';
import VueRouter from 'vue-router';
import Route, { route } from './Main/Route';

Vue.use(VueRouter);

const routes = Route.create([
	route('/', 'Dashboard').name('dashboard')
		.title('WALC')
		.layoutProps({ hideBackButton: true }),
	route('/tools', 'Tools').name('tools'),
	route('/settings', 'Settings').name('settings'),
	route('/help', 'Help').name('help'),
	route('/offline', 'Offline').name('offline'),
	Route.group({
		prefix: '/settings',
		as: 'settings.',
		namespace: 'Settings',
		layoutProps: { title: 'Settings' },
	}, [
		route('/general', 'General').name('general'),
		route('/notification', 'Notification').name('notification'),
		route('/app-lock', 'AppLock').name('app-lock'),
		route('/tray-icon', 'TrayIcon').name('tray-icon'),
		route('/advanced', 'Advanced').name('advanced'),
	]),
]);

export default new VueRouter({ routes });
