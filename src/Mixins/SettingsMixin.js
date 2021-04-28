const { ipcRenderer } = window.require('electron');

export default {
	async created() {
		this.settings = await ipcRenderer.sendSync('getSettings', this.group);
		Object.keys(this.settings).forEach((key) => {
			this.$watch(`settings.${key}.value`, (value) => {
				ipcRenderer.sendSync('setSettings', { [`${this.group}.${key}.value`]: value })
			});
		})
	},

	data() {
		return {
			settings: {},
		}
	},
}