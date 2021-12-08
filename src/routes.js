import Vue from 'vue';
import VueRouter from 'vue-router';
import Route, { route } from './Main/Route';

Vue.use(VueRouter);

const routes = Route.create([
	route('/', 'Dashboard').name('dashboard'),
	route('/tools', 'Tools').name('tools'),
	route('/settings', 'Settings').name('settings'),
	route('/help', 'Help').name('help'),
	route('/offline', 'Offline').name('offline'),
	Route.group({ prefix: '/settings', as: 'settings.', namespace: 'Settings' }, [
		route('/general', 'General').name('general'),
		route('/notification', 'Notification').name('notification'),
		route('/tray-icon', 'TrayIcon').name('tray-icon'),
		route('/advanced', 'Advanced').name('advanced'),
	]),
]);

export default new VueRouter({ routes });
