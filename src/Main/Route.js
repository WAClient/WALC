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

	layout(layout, props) {
		this._layout = layout;
		this._layoutProps = props;
		return this;
	}

	meta(meta) {
		this._meta = meta;
		return this;
	}

	_get() {
		const { prefix = '', as = '', namespace = '' } = this._group;
		let path = `${prefix}/${this._path}`;
		path = path.replace(/\/\//g, '/');
		const name = `${as}${this._name}`;
		let page = `${namespace}/${this._page}`;
		page = page.replace(/^\//, '');
		return {
			path,
			component: () => import(`@/Pages/${page}`),
			name,
			meta: {
				layout: this._layout,
				layoutProps: this._layoutProps,
				...this._meta,
			}
		};
	}
}

export function route(path, page) {
	return Route.make(path, page);
}
