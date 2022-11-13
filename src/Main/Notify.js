const EventEmitter = require('events');
const { sessionBus: SessionBus, Variant } = require('dbus-next');
const checkTypes = require('./utils/checkTypes');

const ActionInvokedSymbol = Symbol('actionInvoked');
const ActionEvents = Object.freeze({
  ActionInvoked: 'ActionInvoked',
  NotificationClosed: 'NotificationClosed',
  NotificationReplied: 'NotificationReplied',
});
const ActionKeys = Object.freeze({
  DEFAULT: 'default',
});

let externalSessionBus;
let selfSessionBus;
let Notifications;
let getInterfaceStat = false;
const notificationCounter = [];

const Config = {
  autoDisconnectSessionBus: true,
};

const notifierEmitter = new EventEmitter();

const disconnectSessionBus = function disconnectSessionBus() {
  if (!selfSessionBus) {
    return;
  }
  // Save it for delayed disconnection.
  const sessionBus = selfSessionBus;
  selfSessionBus = undefined;
  // dbus-next bug
  // disconnecting the dbus connection immediately will throw an error, so let's delay the disconnection just in case.
  setTimeout(() => {
    sessionBus.disconnect();
  }, 100);
};

const actionInvoked = function actionInvoked(id, actionKey) {
  notifierEmitter.emit(`${ActionEvents.ActionInvoked}:${id}`, actionKey);
};

const notificationClosed = function notificationClosed(id, reason) {
  notifierEmitter.emit(`${ActionEvents.NotificationClosed}:${id}`, reason);
};

const notificationReplied = function notificationReplied(id, message) {
  notifierEmitter.emit(`${ActionEvents.NotificationReplied}:${id}`, message);
};

const bindNotifications = function bindNotifications(notificationInterface) {
  // Since the NotificationClosed event will fire when any notification is closed
  // using ID to trigger the event here allows us to use once() elsewhere without binding too many events.
  notificationInterface.on(ActionEvents.ActionInvoked, actionInvoked);
  notificationInterface.on(ActionEvents.NotificationClosed, notificationClosed);
  notificationInterface.on(ActionEvents.NotificationReplied, notificationReplied);
  Notifications = notificationInterface;
  return Notifications;
};

const unsetNotifications = function unsetNotifications() {
  if (!Notifications) {
    return;
  }
  Notifications.off(ActionEvents.ActionInvoked, actionInvoked);
  Notifications.off(ActionEvents.NotificationClosed, notificationClosed);
  Notifications.off(ActionEvents.NotificationReplied, notificationReplied);
  Notifications = undefined;
};

const getSessionBus = function getSessionBus() {
  if (externalSessionBus) {
    return externalSessionBus;
  }
  if (!selfSessionBus) {
    selfSessionBus = SessionBus({ busAddress: process.env.DBUS_SESSION_BUS_ADDRESS });
  }
  return selfSessionBus;
};

const setSessionBus = function setSessionBus(sessionBus) {
  unsetNotifications();
  disconnectSessionBus();
  externalSessionBus = sessionBus;
  Config.autoDisconnectSessionBus = Config.autoDisconnectSessionBus && !sessionBus;
};

const getInterface = function getInterface() {
  if (Notifications) {
    return Promise.resolve(Notifications);
  }
  if (getInterfaceStat) {
    return new Promise((resolve, reject) => {
      notifierEmitter.once('getInterface', resolve);
      notifierEmitter.once('getInterfaceError', reject);
    });
  }
  getInterfaceStat = true;
  return new Promise((reslove, reject) => {
    getSessionBus().getProxyObject('org.freedesktop.Notifications', '/org/freedesktop/Notifications')
      .then((obj) => {
        const i = bindNotifications(obj.getInterface('org.freedesktop.Notifications'));
        notifierEmitter.emit('getInterface', i);
        reslove(i);
      })
      .catch((err) => {
        if (Config.autoDisconnectSessionBus) {
          disconnectSessionBus();
        }
        notifierEmitter.emit('getInterfaceError', err);
        reject(err);
      })
      .finally(() => {
        getInterfaceStat = false;
      });
  });
};

const setInterface = function setInterface(notificationInterface) {
  unsetNotifications();
  disconnectSessionBus();
  if (notificationInterface) {
    bindNotifications(notificationInterface);
  } else {
    // Get a new one to continue processing old events.
    getInterface();
  }
};

const genIdentifier = function* genIdentifier() {
  let IX = 0;
  while (true) {
    IX = IX >= 25 ? 0 : IX + 1;
    const ide = String.fromCharCode(64 + IX);
    yield ide;
  }
};
const identifier = genIdentifier();

notifierEmitter.on('push', () => {
  notificationCounter.push(true);
});

notifierEmitter.on('pop', () => {
  notificationCounter.pop();
  if (Config.autoDisconnectSessionBus && selfSessionBus && notificationCounter.length === 0) {
    unsetNotifications();
    disconnectSessionBus();
  }
});

class Notify extends EventEmitter {
  #id = 0;

  #status = 0;

  #actions = new Map();

  #config = {};

  // NodeJS 12 private method not supported
  [ActionInvokedSymbol](key, ...args) {
    const action = this.#actions.get(key);
    if (typeof action.callback === 'function') {
      action.callback(...args);
    }
  }

  get id() {
    return this.#id;
  }

  get status() {
    return this.#status;
  }

  constructor(config) {
    super();

    this.#config = {
      appName: config.appName || '',
      replacesId: config.replacesId || 0,
      appIcon: config.appIcon || '',
      summary: config.summary || '',
      body: config.body || '',
      hints: config.hints || {},
      timeout: config.timeout || 0,
    };

    checkTypes.string(this.#config.appName, 'appName is not string.');
    checkTypes.integer(this.#config.replacesId, 'replacesId is not integer.');
    checkTypes.string(this.#config.appIcon, 'appIcon is not string.');
    checkTypes.string(this.#config.summary, 'summary is not string.');
    checkTypes.string(this.#config.body, 'body is not string.');
    checkTypes.object(this.#config.hints, 'hints is not object.');
    checkTypes.integer(this.#config.timeout, 'timeout is not integer.');

    const { hints } = this.#config;
    this.#config.hints = {};

    if ('actionIcons' in hints && checkTypes.boolean(hints.actionIcons, 'hints.actionIcons is not boolean.')) {
      this.#config.hints['action-icons'] = new Variant('b', hints.actionIcons);
    }

    if ('category' in hints && checkTypes.string(hints.category, 'hints.category is not string.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['category'] = new Variant('s', hints.category);
    }

    if ('desktopEntry' in hints && checkTypes.string(hints.desktopEntry, 'hints.desktopEntry is not string.')) {
      this.#config.hints['desktop-entry'] = new Variant('s', hints.desktopEntry);
    }

    if ('imagePath' in hints && checkTypes.string(hints.imagePath, 'hints.imagePath is not string.')) {
      this.#config.hints['image-path'] = new Variant('s', hints.imagePath);
    }

    if ('imageData' in hints && checkTypes.object(hints.imageData, 'hints.imagePath is not object.') && hints.imageData) {
      const channel = (hints.imageData.hasAlpha ? 4 : 3);
      this.#config.hints['image-data'] = new Variant('(iiibiiay)', [
        hints.imageData.width,
        hints.imageData.height,
        hints.imageData.width * channel,
        hints.imageData.hasAlpha,
        8,
        channel,
        hints.imageData.data,
      ]);
    }

    if ('resident' in hints && checkTypes.boolean(hints.resident, 'hints.resident is not boolean.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['resident'] = new Variant('b', hints.resident);
    }

    if ('soundFile' in hints && checkTypes.string(hints.soundFile, 'hints.soundFile is not string.')) {
      this.#config.hints['sound-file'] = new Variant('s', hints.soundFile);
    }

    if ('soundName' in hints && checkTypes.string(hints.soundName, 'hints.soundName is not string.')) {
      this.#config.hints['sound-name'] = new Variant('s', hints.soundName);
    }

    if ('suppressSound' in hints && checkTypes.boolean(hints.suppressSound, 'hints.suppressSound is not boolean.')) {
      this.#config.hints['suppress-sound'] = new Variant('b', hints.suppressSound);
    }

    if ('transient' in hints && checkTypes.boolean(hints.transient, 'hints.transient is not boolean.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['transient'] = new Variant('b', hints.transient);
    }

    if ('value' in hints && checkTypes.integer(hints.value, 'hints.value is not integer.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['value'] = new Variant('i', hints.value);
    }

    if ('x' in hints && checkTypes.integer(hints.x, 'hints.x is not integer.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['x'] = new Variant('i', hints.x);
    }

    if ('y' in hints && checkTypes.integer(hints.y, 'hints.y is not integer.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['y'] = new Variant('i', hints.y);
    }

    if ('urgency' in hints && checkTypes.integer(hints.urgency, 'hints.urgency is not integer.')) {
      // eslint-disable-next-line dot-notation
      this.#config.hints['urgency'] = new Variant('y', hints.urgency);
    }
  }

  addAction(text, key, callback) {
    const actionCallback = callback === undefined ? key : callback;
    const actionKey = callback === undefined ? `__action_key__::${identifier.next().value}` : key;

    checkTypes.string(text, 'text is not string.');
    checkTypes.string(actionKey, 'key is not string.');
    checkTypes.function(actionCallback, 'callback is not function.');

    if (this.#actions.has(actionKey)) {
      throw new Error(`'${actionKey}' action already exists.`);
    }

    this.#actions.set(actionKey, {
      text,
      callback: actionCallback,
    });
    return actionKey;
  }

  close() {
    if (this.#id !== 0) {
      return getInterface().CloseNotification(this.#id);
    }
    return Promise.resolve();
  }

  removeAction(key) {
    checkTypes.string(key, 'key is not string.');
    return this.#actions.delete(key);
  }

  removeDefaultAction() {
    return this.removeAction(ActionKeys.DEFAULT);
  }

  setDefaultAction(callback) {
    this.addAction('', ActionKeys.DEFAULT, callback);
  }

  show() {
    const actions = [];
    this.#actions.forEach((item, key) => {
      actions.push(key, item.text);
    });
    const params = [
      this.#config.appName,
      this.#config.replacesId,
      this.#config.appIcon,
      this.#config.summary,
      this.#config.body,
      actions,
      this.#config.hints,
      this.#config.timeout,
    ];
    return new Promise((resolve, reject) => {
      getInterface()
        .then((i) => {
          i.Notify(...params)
            .then((id) => {
              const invoked = this[ActionInvokedSymbol].bind(this);
              const inlineReplyInvoked = this[ActionInvokedSymbol].bind(this, 'inline-reply');
              notifierEmitter.on(`${ActionEvents.ActionInvoked}:${id}`, invoked);
              notifierEmitter.on(`${ActionEvents.NotificationReplied}:${id}`, inlineReplyInvoked);
              notifierEmitter.once(`${ActionEvents.NotificationClosed}:${id}`, (reason) => {
                this.#status = 2;
                notifierEmitter.off(`${ActionEvents.ActionInvoked}:${id}`, invoked);
                notifierEmitter.off(`${ActionEvents.NotificationReplied}:${id}`, inlineReplyInvoked);
                notifierEmitter.emit('pop');
                const result = {
                  id,
                  reason,
                };
                this.emit('close', result);
                resolve(result);
              });
              this.#id = id;
              this.#status = 1;
              notifierEmitter.emit('push');
              this.emit('show', id);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  static supportedCapabilities() {
    return new Promise((resolve, reject) => {
      getInterface()
        .then((i) => {
          i.GetCapabilities()
            .then((caps) => {
              resolve(caps);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

module.exports = {
  Notify,
  Config,
  disconnectSessionBus,
  getInterface,
  setInterface,
  getSessionBus,
  setSessionBus,
};
