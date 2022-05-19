const Store = require('electron-store');
const dotProp = require('dot-prop');

const settings = {};
const schema = {
	general: {
		askOnExit: {
			default: true,
			name: 'Ask on Exit',
			description: 'If enabled, WALC will confirm everytime you want to close it.',
			type: 'checkbox',
		},
		alwaysOnTop: {
			default: false,
			name: 'Always On Top',
			description: 'Allow WALC to always be shown in front of other apps',
			type: 'checkbox',
		},
		fullWidth: {
			default: false,
			name: 'Full Width',
			description: 'Force full width on large screen',
			type: 'checkbox',
		},
		spellcheck: {
			default: true,
			name: 'Spellcheck',
			description: 'Change requires restart',
			type: 'checkbox',
		},
	},
	notification: {
		enabled: {
			default: true,
			name: 'Enable Notification',
			type: 'switch',
		},
		offline: {
			default: true,
			name: 'Offline Notification',
			description: 'Notify when whatsapp is disconnected',
			type: 'checkbox',
			depends: 'enabled',
		},
		newStatus: {
			default: false,
			name: 'New Status Updates',
			description: 'Display Notification when someone updates their status.',
			type: 'checkbox',
			depends: 'enabled',
		},
		legacyType: {
			default: false,
			name: 'Use old notification method',
			description: 'Enable this if you have problem with the new notification',
			type: 'checkbox',
			depends: 'enabled',
		},
	},
	trayIcon: {
		enabled: {
			default: true,
			name: 'Enable tray icon',
			type: 'switch',
		},
		closeToTray: {
			default: true,
			name: 'Close to Tray',
			description: 'If enabled, WALC will be hidden everytime you want to close it.',
			type: 'checkbox',
			depends: 'enabled',
		},
		startHidden: {
			default: false,
			name: 'Start Hidden',
			description: 'Hide WALC on startup',
			type: 'checkbox',
			depends: 'enabled',
		},
		countMuted: {
			default: true,
			name: 'Include Muted Chats',
			description: 'Count muted chats in the badge counter',
			type: 'checkbox',
			depends: 'enabled',
		},
	},
	appLock: {
		enabled: {
			default: false,
			name: 'Enable app lock',
			description: 'Lock WALC after some time',
			type: 'switch',
		},
		password: {
			default: '',
			name: 'Password',
			type: 'button',
			text: 'Change Password',
			depends: 'enabled',
			mask: {
				get(value) {
					return !!value;
				},
				set(value, oldValue) {
					return oldValue;
				},
			}
		},
		timeout: {
			default: 300, // in seconds
			name: 'Lock after',
			type: 'select',
			props: {
				items: [
					{ value: 60, text: '1 minute' },
					{ value: 300, text: '5 minutes' },
					{ value: 900, text: '15 minutes' },
					{ value: 1800, text: '30 minutes' },
					{ value: 3600, text: '1 hour' },
				],
			},
			depends: 'enabled',
		},
		lockOnScreenLock: {
			default: false,
			name: 'Lock on Screen Lock',
			description: 'Also lock WALC when screen is locked',
			type: 'checkbox',
			depends: 'enabled',
		},
	},
	advanced: {
		multiInstance: {
			default: false,
			name: 'Allow Multiple Instances',
			description: "It allows you open multiple instances of WALC so you can login to more than one WhatsApp account. It is disabled by default.",
			hidden: true,
		},
	},
	theme: {
		dark: {
			default: false,
		},
	}
};

// get default value from schema
const defaults = Object.keys(schema).reduce((defaults, group) => {
	defaults[group] = Object.keys(schema[group]).reduce((groups, key) => {
		groups[key] = schema[group][key].default;
		return groups;
	}, {});
	return defaults;
}, {});

// init electron-store
const store = new Store({
	name: 'settings',
	defaults: defaults,
});

// attach value getter and setter to electron-store
Object.keys(schema).forEach((group) => {
	Object.keys(schema[group]).forEach((key) => {
		Object.defineProperty(schema[group][key], 'value', {
			get: () => store.get(`${group}.${key}`),
			set: (value) => store.set(`${group}.${key}`, value),
			enumerable: true,
		});
	});
});

settings.store = schema;
settings.get = (key) => dotProp.get(schema, key);
settings.set = (key, value) => {
	dotProp.set(schema, key, value);
};
settings.onDidChange = (key, handler) => {
	return store.onDidChange(key, handler);
};

const maskedSchema = JSON.parse(JSON.stringify(schema));
Object.keys(schema).forEach((group) => {
	Object.keys(schema[group]).forEach((key) => {
		const mask = schema[group][key].mask || {};
		Object.defineProperty(maskedSchema[group][key], 'value', {
			get: () => {
				if(mask.get) {
					return mask.get(schema[group][key].value);
				}
				return store.get(`${group}.${key}`);
			},
			set: (value) => {
				if(mask.set) {
					value = mask.set(value, schema[group][key].value);
				}
				store.set(`${group}.${key}`, value);
			},
			enumerable: true,
		});
	});
});

settings.storeMasked = maskedSchema;
settings.getMasked = (key) => dotProp.get(maskedSchema, key);
settings.setMasked = (key, value) => {
	dotProp.set(maskedSchema, key, value);
};

module.exports = settings;
