import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import router from './routes';
import App from './Pages/App';

const { ipcRenderer } = window.require('electron');

Vue.use(Vuetify);
const vuetify = new Vuetify({
	icons: {
		iconfont: 'mdiSvg',
	},
});

const app = document.getElementById('app');

Vue.prototype.$instance = {
	id: null,
	isSnap: false,
	isAppImage: false,
	exec: (key, ...args) => {
		return ipcRenderer.invoke(`instance.${key}`, vm.$instance.id, ...args);
	},
};

const vm = new Vue({
	vuetify,
	router,
	render: (h) => h(App, { props: {} }),
}).$mount(app);

ipcRenderer.on('setID', (event, { id, isSnap, isAppImage }) => {
	vm.$instance.id = id;
	vm.$instance.isSnap = isSnap;
	vm.$instance.isAppImage = isAppImage;
	console.log(vm.$instance);
});

ipcRenderer.on('navigate', (event, url) => {
	vm.$router.push(url);
});

ipcRenderer.on('darkTheme', (event, status) => {
	vm.$vuetify.theme.dark = status;
});
