import Vue from 'vue';
import Vuex from 'vuex';
import Vuetify from 'vuetify/lib';
import router from './routes';
import App from './Pages/App';

const { ipcRenderer } = window.require('electron');

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		id: null,
		isSnap: false,
		isAppImage: false,
		whatsappConnected: false,
	},
	mutations: {
		setId(state, { id, isSnap, isAppImage }) {
			state.id = id;
			state.isSnap = isSnap;
			state.isAppImage = isAppImage;
		},
		setWhatsappConnected(state, status) {
			state.whatsappConnected = status;
		},
	}
});

Vue.use(Vuetify);
const vuetify = new Vuetify({
	icons: {
		iconfont: 'mdiSvg',
	},
});

const app = document.getElementById('app');

Vue.prototype.$exec = (key, ...args) => {
	return ipcRenderer.invoke(`instance.${key}`, store.state.id, ...args);
};

const vm = new Vue({
	vuetify,
	router,
	store,
	render: (h) => h(App, { props: {} }),
}).$mount(app);

ipcRenderer.on('setID', (event, data) => {
	vm.$store.commit('setId', data);
	console.log('instance', vm.$store.state);
});

ipcRenderer.on('whatsappReady', (event, status) => {
	vm.$store.commit('setWhatsappConnected', status);
	console.log('whatsappConnected', status);
});

ipcRenderer.on('navigate', (event, url) => {
	vm.$router.push(url);
});

ipcRenderer.on('darkTheme', (event, status) => {
	vm.$vuetify.theme.dark = status;
});

window.vm = vm;
