export default class Route {
	constructor(path, page) {
		this._group = {};
		this._path = path;
		this._page = page;
	}

	static make(path, page) {
		return new Route(path, page);
	}

	/**
	 * @param {Route[]} routes
	 * @returns {array}
	 */
	static create(routes) {
		const groups = [];
		routes = routes.map((r, i) => {
			if(Array.isArray(r)) {
				groups.unshift({ i, items: Route.create(r) });
				return null;
			}
			return r._get();
		});
		groups.forEach((group) => {
			routes.splice(group.i, 1, ...group.items);
		});
		return routes;
	}

	/**
	 * Make a route group
	 * @param {Object} conf Group configuration
	 * @param {string} conf.prefix
	 * @param {string} conf.as
	 * @param {string} conf.namespace
	 * @param {string} conf.layout
	 * @param {Object} conf.layoutProps
	 * @param {Route[]|function(): Route[]} group
	 */
	static group(conf, group) {
		if(typeof group === 'function') {
			group = group();
		}
		group.forEach((r) => {
			r._group = conf;
		});
		return group;
	}

	name(name) {
		this._name = name;
		return this;
	}

	title(title) {
		this._title = title;
		return this;
	}

	layout(layout, props) {
		this._layout = layout;
		this._layoutProps = props;
		return this;
	}

	layoutProps(props) {
		this._layoutProps = {
			...this._layoutProps,
			...props,
		};
		return this;
	}

	meta(meta) {
		this._meta = meta;
		return this;
	}

	_generateTitle() {
		if(this._name) {
			return this._name
				.toLowerCase()
				.replace('-', ' ')
				.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
		}
		return 'WALC';
	}

	_get() {
		const { prefix = '', as = '', namespace = '' } = this._group;

		const path = `${prefix}/${this._path}`.replace(/\/\//g, '/');
		const name = `${as}${this._name}`;
		const page = `${namespace}/${this._page}`.replace(/^\//, '');
		const layout = this._layout ?? this._group.layout;
		const layoutProps = this._layoutProps ?? this._group.layoutProps ?? {};
		layoutProps.title = layoutProps.title ?? this._title ?? this._generateTitle();

		return {
			path,
			component: () => import(`@/Pages/${page}`),
			name,
			meta: {
				layout,
				layoutProps,
				...this._meta,
			}
		};
	}
}

export function route(path, page) {
	return Route.make(path, page);
}
