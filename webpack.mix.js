const path = require('path');
const mix = require('laravel-mix');
require('vuetifyjs-mix-extension');

mix.setPublicPath('public')
	.alias({
		"@layouts": path.resolve(__dirname, "src/Layouts/"),
		"@mixins": path.resolve(__dirname, "src/Mixins/"),
	})
	.js('src/app.js', 'js')
	.vuetify('vuetify-loader')
	.vue({ version: 2 });

if(!mix.inProduction()) {
	mix.disableNotifications()
		.sourceMaps();
}
