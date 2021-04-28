import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import Offline from './Pages/Offline';

Vue.use(Vuetify);
const vuetify = new Vuetify({
	icons: {
		iconfont: 'mdiSvg',
	},
});

const app = document.getElementById('app');

const vm = new Vue({
	vuetify,
	render: (h) => h(Offline, { props: {} }),
}).$mount(app);

if(window.location.hash === '#dark') {
	vm.$vuetify.theme.dark = true;
}
