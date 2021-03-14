import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import router from './routes';
import App from './Pages/App';

Vue.use(Vuetify);
const vuetify = new Vuetify({
	icons: {
		iconfont: 'mdiSvg',
	},
});

const app = document.getElementById('app');

new Vue({
	vuetify,
	router,
	render: (h) => h(App, { props: {} }),
}).$mount(app);
